#!/usr/bin/env bash
# Lint for hidden/invisible Unicode characters in diffs (trojan-source attack prevention).
# Requires Perl (pre-installed on GitHub Actions Ubuntu runners).
#
# Usage:
#   bash tools/linter_hidden_unicode.sh --stdin      # read diff from stdin (CI mode)
#   bash tools/linter_hidden_unicode.sh <base-ref>   # diff against a base ref
#   bash tools/linter_hidden_unicode.sh              # diff staged changes (git diff --cached)

set -euo pipefail

# Binary file extensions to skip
BINARY_PATTERN='\.(png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|otf|zip|tar|gz|bz2|xz|7z|rar|pdf|dll|exe|so|dylib|o|obj|class|jar|war|pyc|pyo|wasm|bin|dat|db|sqlite|nupkg|snupkg)$'

get_diff() {
    if [[ "${1:-}" == "--stdin" ]]; then
        cat
    elif [[ -n "${1:-}" ]]; then
        # Validate ref argument to prevent command injection
        if ! [[ "$1" =~ ^[a-zA-Z0-9._/-]+$ ]]; then
            echo "ERROR: Invalid ref argument: $1" >&2
            exit 1
        fi
        if ! git rev-parse --verify "$1" >/dev/null 2>&1; then
            echo "ERROR: Git ref not found: $1" >&2
            exit 2
        fi
        git diff "$1"
    else
        git diff --cached
    fi
}

# Perl script that:
# 1. Tracks current file from diff headers
# 2. Skips binary files
# 3. Scans only added lines (starting with +, excluding +++ headers)
# 4. Detects ~30+ categories of invisible/suspicious Unicode characters
PERL_SCRIPT='
use utf8;
use strict;
use warnings;

sub escape_property {
    my ($s) = @_;
    $s =~ s/%/%25/g;
    $s =~ s/\r/%0D/g;
    $s =~ s/\n/%0A/g;
    $s =~ s/:/%3A/g;
    $s =~ s/,/%2C/g;
    return $s;
}

sub escape_message {
    my ($s) = @_;
    $s =~ s/%/%25/g;
    $s =~ s/\r/%0D/g;
    $s =~ s/\n/%0A/g;
    return $s;
}

my $file = "";
my $line_in_file = 0;
my $errors = 0;
my $in_binary = 0;
my $binary_pattern = qr/'"$BINARY_PATTERN"'/i;

while (<STDIN>) {
    chomp;

    # Track file from diff headers
    if (/^\+\+\+ b\/(.+)$/) {
        $file = $1;
        $line_in_file = 0;
        $in_binary = ($file =~ $binary_pattern) ? 1 : 0;
        next;
    }

    # Skip binary file markers
    if (/^Binary files/) {
        $in_binary = 1;
        next;
    }

    # Track hunk headers for line numbers
    if (/^@@ -\d+(?:,\d+)? \+(\d+)/) {
        $line_in_file = $1 - 1;
        next;
    }

    # Count lines in the new file
    if (/^\+/ || /^ /) {
        $line_in_file++;
    }

    # Only scan added lines, skip binary files
    next if $in_binary;
    next unless /^\+/;
    next if /^\+\+\+ (?:$|b\/|\/dev\/null)/;

    # Remove the leading + for scanning
    my $content = substr($_, 1);

    # Check for suspicious invisible Unicode characters:
    # - Bidi overrides and isolates (U+200E-200F, U+202A-202E, U+2066-2069)
    # - Zero-width characters (U+200B-200D, U+2060)
    # - Byte order mark mid-line (U+FEFF)
    # - Soft hyphen (U+00AD)
    # - Mongolian vowel separator (U+180E)
    # - Combining grapheme joiner (U+034F)
    # - Function application and invisible operators (U+2061-2064)
    # - Hangul fillers (U+115F, U+1160, U+3164, U+FFA0)
    # - Interlinear annotation (U+FFF9-FFFB)
    # - Object replacement / replacement char (U+FFFC-FFFD) -- FFFD is sometimes legitimate
    # - Unicode tag block (U+E0001, U+E0020-E007F)
    # - Deprecated format chars (U+206A-206F)
    if ($content =~ /([\x{00AD}\x{034F}\x{115F}\x{1160}\x{180E}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{206A}-\x{206F}\x{3164}\x{FE00}-\x{FE0F}\x{FEFF}\x{FFA0}\x{FFF9}-\x{FFFB}\x{E0001}\x{E0020}-\x{E007F}])/) {
        my $char = $1;
        my $codepoint = sprintf("U+%04X", ord($char));
        my $col = $-[1] + 1;

        if ($ENV{GITHUB_ACTIONS}) {
            my $efile = escape_property($file);
            my $emsg = escape_message("Hidden Unicode character ${codepoint} found");
            print "::error file=${efile},line=${line_in_file},col=${col}::${emsg}\n";
        } else {
            print "ERROR: $file:$line_in_file:$col - Hidden Unicode character $codepoint found\n";
        }
        $errors++;
    }
}

if ($errors > 0) {
    print "\nFound $errors hidden Unicode character(s) in added lines.\n";
    print "These may indicate a trojan-source attack. See https://trojansource.codes/\n";
    exit 1;
} else {
    print "No hidden Unicode characters detected.\n";
    exit 0;
}
'

get_diff "$@" | perl -CS -e "$PERL_SCRIPT"
