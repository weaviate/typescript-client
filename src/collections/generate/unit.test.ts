import { GenerativeConfigRuntimeType, ModuleConfig } from '../types';
import { generativeConfigRuntime } from './config';

// only tests fields that must be mapped from some public name to a gRPC name, e.g. baseURL -> baseUrl and stop: string[] -> stop: TextArray
describe('Unit testing of the generativeConfigRuntime factory methods', () => {
  describe('anthropic', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.anthropic();
      expect(config).toEqual<
        ModuleConfig<'generative-anthropic', GenerativeConfigRuntimeType<'generative-anthropic'> | undefined>
      >({
        name: 'generative-anthropic',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.anthropic({
        baseURL: 'http://localhost:8080',
        stopSequences: ['a', 'b', 'c'],
      });
      expect(config).toEqual<
        ModuleConfig<'generative-anthropic', GenerativeConfigRuntimeType<'generative-anthropic'> | undefined>
      >({
        name: 'generative-anthropic',
        config: {
          baseUrl: 'http://localhost:8080',
          stopSequences: { values: ['a', 'b', 'c'] },
        },
      });
    });
  });

  describe('anyscale', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.anyscale();
      expect(config).toEqual<
        ModuleConfig<'generative-anyscale', GenerativeConfigRuntimeType<'generative-anyscale'> | undefined>
      >({
        name: 'generative-anyscale',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.anyscale({
        baseURL: 'http://localhost:8080',
      });
      expect(config).toEqual<
        ModuleConfig<'generative-anyscale', GenerativeConfigRuntimeType<'generative-anyscale'> | undefined>
      >({
        name: 'generative-anyscale',
        config: {
          baseUrl: 'http://localhost:8080',
        },
      });
    });
  });

  describe('aws', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.aws();
      expect(config).toEqual<
        ModuleConfig<'generative-aws', GenerativeConfigRuntimeType<'generative-aws'> | undefined>
      >({
        name: 'generative-aws',
        config: undefined,
      });
    });
  });

  describe('azure-openai', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.azureOpenAI();
      expect(config).toEqual<
        ModuleConfig<'generative-azure-openai', GenerativeConfigRuntimeType<'generative-azure-openai'>>
      >({
        name: 'generative-azure-openai',
        config: { isAzure: true },
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.azureOpenAI({
        baseURL: 'http://localhost:8080',
        model: 'model',
        stop: ['a', 'b', 'c'],
      });
      expect(config).toEqual<
        ModuleConfig<'generative-azure-openai', GenerativeConfigRuntimeType<'generative-azure-openai'>>
      >({
        name: 'generative-azure-openai',
        config: {
          baseUrl: 'http://localhost:8080',
          stop: { values: ['a', 'b', 'c'] },
          model: 'model',
          isAzure: true,
        },
      });
    });
  });

  describe('cohere', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.cohere();
      expect(config).toEqual<
        ModuleConfig<'generative-cohere', GenerativeConfigRuntimeType<'generative-cohere'> | undefined>
      >({
        name: 'generative-cohere',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.cohere({
        baseURL: 'http://localhost:8080',
        stopSequences: ['a', 'b', 'c'],
      });
      expect(config).toEqual<
        ModuleConfig<'generative-cohere', GenerativeConfigRuntimeType<'generative-cohere'> | undefined>
      >({
        name: 'generative-cohere',
        config: {
          baseUrl: 'http://localhost:8080',
          stopSequences: { values: ['a', 'b', 'c'] },
        },
      });
    });
  });

  describe('databricks', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.databricks();
      expect(config).toEqual<
        ModuleConfig<
          'generative-databricks',
          GenerativeConfigRuntimeType<'generative-databricks'> | undefined
        >
      >({
        name: 'generative-databricks',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.databricks({
        stop: ['a', 'b', 'c'],
      });
      expect(config).toEqual<
        ModuleConfig<
          'generative-databricks',
          GenerativeConfigRuntimeType<'generative-databricks'> | undefined
        >
      >({
        name: 'generative-databricks',
        config: {
          stop: { values: ['a', 'b', 'c'] },
        },
      });
    });
  });

  describe('friendliai', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.friendliai();
      expect(config).toEqual<
        ModuleConfig<
          'generative-friendliai',
          GenerativeConfigRuntimeType<'generative-friendliai'> | undefined
        >
      >({
        name: 'generative-friendliai',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.friendliai({
        baseURL: 'http://localhost:8080',
      });
      expect(config).toEqual<
        ModuleConfig<
          'generative-friendliai',
          GenerativeConfigRuntimeType<'generative-friendliai'> | undefined
        >
      >({
        name: 'generative-friendliai',
        config: {
          baseUrl: 'http://localhost:8080',
        },
      });
    });
  });

  describe('mistral', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.mistral();
      expect(config).toEqual<
        ModuleConfig<'generative-mistral', GenerativeConfigRuntimeType<'generative-mistral'> | undefined>
      >({
        name: 'generative-mistral',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.mistral({
        baseURL: 'http://localhost:8080',
      });
      expect(config).toEqual<
        ModuleConfig<'generative-mistral', GenerativeConfigRuntimeType<'generative-mistral'> | undefined>
      >({
        name: 'generative-mistral',
        config: {
          baseUrl: 'http://localhost:8080',
        },
      });
    });
  });

  describe('nvidia', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.nvidia();
      expect(config).toEqual<
        ModuleConfig<'generative-nvidia', GenerativeConfigRuntimeType<'generative-nvidia'> | undefined>
      >({
        name: 'generative-nvidia',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.nvidia({
        baseURL: 'http://localhost:8080',
      });
      expect(config).toEqual<
        ModuleConfig<'generative-nvidia', GenerativeConfigRuntimeType<'generative-nvidia'> | undefined>
      >({
        name: 'generative-nvidia',
        config: {
          baseUrl: 'http://localhost:8080',
        },
      });
    });
  });

  describe('ollama', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.ollama();
      expect(config).toEqual<
        ModuleConfig<'generative-ollama', GenerativeConfigRuntimeType<'generative-ollama'> | undefined>
      >({
        name: 'generative-ollama',
        config: undefined,
      });
    });
  });

  describe('openai', () => {
    it('with defaults', () => {
      const config = generativeConfigRuntime.openAI();
      expect(config).toEqual<
        ModuleConfig<'generative-openai', GenerativeConfigRuntimeType<'generative-openai'>>
      >({
        name: 'generative-openai',
        config: { isAzure: false },
      });
    });
    it('with values', () => {
      const config = generativeConfigRuntime.openAI({
        baseURL: 'http://localhost:8080',
        model: 'model',
        stop: ['a', 'b', 'c'],
      });
      expect(config).toEqual<
        ModuleConfig<'generative-openai', GenerativeConfigRuntimeType<'generative-openai'>>
      >({
        name: 'generative-openai',
        config: {
          baseUrl: 'http://localhost:8080',
          isAzure: false,
          model: 'model',
          stop: { values: ['a', 'b', 'c'] },
        },
      });
    });
  });
});
