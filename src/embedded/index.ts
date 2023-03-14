/* eslint-disable no-sync */
import fs from 'fs';
import { get } from 'https';
import net from 'net';
import { spawn } from 'child_process';
import { dirname } from 'path/posix';
import { homedir } from 'os';
import { join } from 'path';
import { extract } from 'tar';

const defaultBinaryPath = join(homedir(), '.cache/weaviate-embedded');
const defaultPersistenceDataPath = join(homedir(), '.local/share/weaviate');
const defaultVersion = '1.18.0';

interface EmbeddedOptionsConfig {
  host?: string;
  port?: number;
  env?: object;
  version?: string;
}

export class EmbeddedOptions {
  binaryPath: string;
  persistenceDataPath: string;
  host: string;
  port: number;
  clusterHostname: string;
  version: string;
  env: NodeJS.ProcessEnv;

  constructor(cfg?: EmbeddedOptionsConfig) {
    this.clusterHostname = 'embedded';
    this.host = (cfg && cfg.host) || '127.0.0.1';
    this.port = (cfg && cfg.port) || 6666;
    this.version = this.setVersion(cfg);
    this.binaryPath = this.setBinaryPath(cfg);
    this.persistenceDataPath = this.setPersistenceDataPath();
    this.env = this.setEnv(cfg);
  }

  setEnv(cfg?: EmbeddedOptionsConfig): NodeJS.ProcessEnv {
    if (!this.persistenceDataPath) {
      this.persistenceDataPath = this.setPersistenceDataPath();
    }

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true',
      QUERY_DEFAULTS_LIMIT: '20',
      PERSISTENCE_DATA_PATH: this.persistenceDataPath,
      CLUSTER_HOSTNAME: this.clusterHostname,
      DEFAULT_VECTORIZER_MODULE: 'none',
      ENABLE_MODULES:
        'text2vec-openai,text2vec-cohere,text2vec-huggingface,' +
        'ref2vec-centroid,generative-openai,qna-openai',
    };

    if (cfg && cfg.env) {
      Object.entries(cfg.env).forEach(([key, value]) => {
        env[key] = value;
      });
    }
    return env;
  }

  setVersion(cfg?: EmbeddedOptionsConfig): string {
    if (!cfg || !cfg.version) {
      return defaultVersion;
    }
    if (cfg.version.match(/[1-9]\.[1-9]{2}\..*/g)) {
      return cfg.version;
    } else {
      throw new Error(
        `invalid version: ${cfg.version}. version must resemble '{major}.{minor}.{patch}'`
      );
    }
  }

  setBinaryPath(cfg?: EmbeddedOptionsConfig): string {
    let binaryPath = process.env.XDG_CACHE_HOME;
    if (!binaryPath) {
      binaryPath = defaultBinaryPath;
    }
    if (!this.version) {
      this.version = this.setVersion(cfg);
    }
    return `${binaryPath}-${this.version}`;
  }

  setPersistenceDataPath(): string {
    let persistenceDataPath = process.env.XDG_DATA_HOME;
    if (!persistenceDataPath) {
      persistenceDataPath = defaultPersistenceDataPath;
    }
    return persistenceDataPath;
  }
}

export class EmbeddedDB {
  options: EmbeddedOptions;
  pid: number;

  constructor(opt: EmbeddedOptions) {
    this.options = opt;
    this.pid = 0;
    ensurePathsExist(this.options);
    checkSupportedPlatform();
  }

  async start() {
    if (await isListening(this.options)) {
      console.log(
        `Embedded db already listening @ ${this.options.clusterHostname}:${this.options.port}`
      );
    }

    await ensureWeaviateBinaryExists(this.options);

    if (!this.options.env.CLUSTER_GOSSIP_BIND_PORT) {
      this.options.env.CLUSTER_GOSSIP_BIND_PORT = await getRandomPort();
    }

    const childProc = spawn(
      this.options.binaryPath,
      [
        '--host',
        this.options.host,
        '--port',
        `${this.options.port}`,
        '--scheme',
        'http',
      ],
      { env: this.options.env }
    );

    childProc.on('error', (err) => {
      console.log(`embedded db failed to start: ${JSON.stringify(err)}`);
    });

    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);

    this.pid = childProc.pid as number;
    console.log(
      `Started ${this.options.binaryPath} @ ${this.options.host}:${this.options.port} -- process ID ${this.pid}`
    );

    await waitTillListening(this.options);
  }

  stop() {
    try {
      process.kill(this.pid, 'SIGTERM');
      console.log(`Embedded db @ PID ${this.pid} successfully stopped`);
    } catch (err) {
      console.log(
        `Tried to stop embedded db @ PID ${this.pid}.`,
        `PID not found, so nothing will be done`
      );
    }
  }
}

function ensurePathsExist(opt: EmbeddedOptions) {
  const binPathDir = dirname(opt.binaryPath);
  fs.mkdirSync(binPathDir, { recursive: true });
  fs.mkdirSync(opt.persistenceDataPath, { recursive: true });
}

function checkSupportedPlatform() {
  const platform: string = process.platform;
  if (platform == 'darwin' || platform == 'win32') {
    throw new Error(`${platform} is not supported with EmbeddedDB`);
  }
}

async function ensureWeaviateBinaryExists(opt: EmbeddedOptions) {
  if (!fs.existsSync(`${opt.binaryPath}`)) {
    console.log(
      `Binary ${opt.binaryPath} does not exist.`,
      `Downloading binary for version ${opt.version}`
    );
    await downloadBinary(opt).then((tarballPath) =>
      untarBinary(opt, tarballPath)
    );
  }
}

function downloadBinary(opt: EmbeddedOptions): Promise<string> {
  const tarballPath = `${opt.binaryPath}.tgz`;
  const file = fs.createWriteStream(tarballPath);
  return new Promise((resolve, reject) => {
    const url =
      'https://github.com/weaviate/weaviate/releases' +
      `/download/v${opt.version}/weaviate-v${opt.version}-linux-amd64.tar.gz`;
    get(url, (resp) => {
      if (resp.statusCode == 302 && resp.headers.location) {
        get(resp.headers.location, (resp) => {
          resp.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(tarballPath);
          });
        });
      } else if (resp.statusCode == 404) {
        reject(
          new Error(
            `failed to download binary: not found. ` +
              `are you sure Weaviate version ${opt.version} exists? ` +
              `note that embedded db is only support for versions >= 1.18.0`
          )
        );
      } else {
        reject(
          new Error(
            `failed to download binary: unexpected status code: ${resp.statusCode}`
          )
        );
      }
    }).on('error', function (err) {
      fs.unlinkSync(tarballPath);
      reject(new Error(`failed to download binary: ${JSON.stringify(err)}`));
    });
  });
}

function untarBinary(opt: EmbeddedOptions, tarballPath: string): Promise<null> {
  const tarball = fs.createReadStream(tarballPath);
  return new Promise((resolve, reject) => {
    tarball.pipe(
      extract({
        cwd: dirname(tarballPath),
        strict: true,
      })
        .on('finish', () => {
          tarball.close();
          fs.renameSync(
            join(dirname(opt.binaryPath), 'weaviate'),
            opt.binaryPath
          );
          resolve(null);
        })
        .on('error', function (err) {
          reject(new Error(`failed to untar binary: ${JSON.stringify(err)}`));
        })
    );
  });
}

function getRandomPort(): Promise<string> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      if (port) {
        srv.close(() => resolve(port.toString()));
      } else {
        reject(new Error('failed to find open port'));
      }
    });
  });
}

function waitTillListening(opt: EmbeddedOptions): Promise<null> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      clearInterval(interval);
      reject(
        new Error(`failed to connect to embedded db @ ${opt.host}:${opt.port}`)
      );
    }, 30000);

    const interval = setInterval(() => {
      isListening(opt).then((listening) => {
        if (listening) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve(null);
        }
      });
    }, 500);
  });
}

function isListening(opt: EmbeddedOptions): Promise<boolean> {
  const sock = net.connect(opt.port, opt.host);
  return new Promise((resolve) => {
    sock
      .on('connect', () => {
        console.log('connected to embedded db!');
        sock.destroy();
        resolve(true);
      })
      .on('error', (err) => {
        console.log('Trying to connect to embedded db...', JSON.stringify(err));
        sock.destroy();
        resolve(false);
      });
  });
}
