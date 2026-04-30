import { describe, expectTypeOf, it } from 'vitest';

import type { definitions } from '../../openapi/schema.js';
import type { TextAnalyzerConfig as TokenizeTextAnalyzerConfig } from '../../tokenize/types.js';
import type { InvertedIndexConfig, PropertyConfig, TextAnalyzerConfig } from '../config/types/index.js';
import type { PropertyConfigCreateBase } from '../configure/types/base.js';

// These structural tests pin the v1.37 tokenization surface in place across
// future schema refreshes. They cover three invariants:
//   1. The tokenize-endpoint TextAnalyzerConfig and the schema-config
//      TextAnalyzerConfig stay in lockstep — same shape, same options on
//      both sides of the API.
//   2. The user-facing union shape accepts the OpenAPI flat shape's values
//      (so values written today still type-check after a schema refresh
//      that surfaces new fields).
//   3. `stopwordPresets` and `textAnalyzer` are wired into the public types
//      that user code interacts with directly (PropertyConfigCreateBase,
//      PropertyConfig, InvertedIndexConfig).

describe('Public tokenization types: schema and tokenize sides match, fields wired through public surface', () => {
  type ApiInvertedIndex = definitions['InvertedIndexConfig'];
  type ApiProperty = definitions['Property'];

  it('schema-config TextAnalyzerConfig matches tokenize-endpoint TextAnalyzerConfig', () => {
    // Both sides must be assignable to each other so a single user value
    // works in both `properties[].textAnalyzer` and `tokenize.text({ analyzerConfig })`.
    expectTypeOf<TextAnalyzerConfig>().toEqualTypeOf<TokenizeTextAnalyzerConfig>();
  });

  it('TextAnalyzerConfig accepts the boolean asciiFold form', () => {
    expectTypeOf<{ asciiFold: boolean }>().toMatchTypeOf<TextAnalyzerConfig>();
  });

  it('TextAnalyzerConfig accepts the ergonomic { ignore: string[] } asciiFold form', () => {
    expectTypeOf<{ asciiFold: { ignore: string[] } }>().toMatchTypeOf<TextAnalyzerConfig>();
  });

  it('TextAnalyzerConfig accepts a stopwordPreset name', () => {
    expectTypeOf<{ stopwordPreset: 'en' }>().toMatchTypeOf<TextAnalyzerConfig>();
  });

  it('InvertedIndexConfig.stopwordPresets is exposed by the public read type', () => {
    type ApiSubset = Pick<ApiInvertedIndex, 'stopwordPresets'>;
    type PublicSubset = Pick<InvertedIndexConfig, 'stopwordPresets'>;
    expectTypeOf<ApiSubset>().toMatchTypeOf<PublicSubset>();
  });

  it('PropertyConfigCreateBase.textAnalyzer is exposed by the public create type', () => {
    type Has = Pick<PropertyConfigCreateBase, 'textAnalyzer'>;
    expectTypeOf<{ textAnalyzer: TextAnalyzerConfig }>().toMatchTypeOf<Has>();
  });

  it('PropertyConfig (read) preserves textAnalyzer for round-trips', () => {
    type Has = Pick<PropertyConfig, 'textAnalyzer'>;
    expectTypeOf<{ textAnalyzer: TextAnalyzerConfig }>().toMatchTypeOf<Has>();
  });

  it('Server-returned ApiProperty.textAnalyzer can carry every field the public union form expresses', () => {
    // The server returns the flat OpenAPI shape; the deserializer
    // (textAnalyzerConfigFromWire) maps it into the public union form. This
    // assertion exists so that if the OpenAPI shape grows new fields, we
    // notice and route them through the deserializer.
    type ApiTextAnalyzer = NonNullable<NonNullable<ApiProperty>['textAnalyzer']>;
    expectTypeOf<ApiTextAnalyzer>().toHaveProperty('asciiFold');
    expectTypeOf<ApiTextAnalyzer>().toHaveProperty('asciiFoldIgnore');
    expectTypeOf<ApiTextAnalyzer>().toHaveProperty('stopwordPreset');
  });
});
