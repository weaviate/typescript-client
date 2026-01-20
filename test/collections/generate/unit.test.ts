import { describe, expect, it } from 'vitest';
import { generativeParameters } from '../../../src/collections/generate/config';
import { GenerativeConfigRuntimeType, ModuleConfig } from '../../../src/collections/types';

// only tests fields that must be mapped from some public name to a gRPC name, e.g. baseURL -> baseUrl and stop: string[] -> stop: TextArray
describe('Unit testing of the generativeParameters factory methods', () => {
  describe('anthropic', () => {
    it('with defaults', () => {
      const config = generativeParameters.anthropic();
      expect(config).toEqual<
        ModuleConfig<'generative-anthropic', GenerativeConfigRuntimeType<'generative-anthropic'> | undefined>
      >({
        name: 'generative-anthropic',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.anthropic({
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
      const config = generativeParameters.anyscale();
      expect(config).toEqual<
        ModuleConfig<'generative-anyscale', GenerativeConfigRuntimeType<'generative-anyscale'> | undefined>
      >({
        name: 'generative-anyscale',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.anyscale({
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
      const config = generativeParameters.aws();
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
      const config = generativeParameters.azureOpenAI();
      expect(config).toEqual<
        ModuleConfig<'generative-azure-openai', GenerativeConfigRuntimeType<'generative-azure-openai'>>
      >({
        name: 'generative-azure-openai',
        config: { isAzure: true },
      });
    });
    it('with values', () => {
      const config = generativeParameters.azureOpenAI({
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
      const config = generativeParameters.cohere();
      expect(config).toEqual<
        ModuleConfig<'generative-cohere', GenerativeConfigRuntimeType<'generative-cohere'> | undefined>
      >({
        name: 'generative-cohere',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.cohere({
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
      const config = generativeParameters.databricks();
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
      const config = generativeParameters.databricks({
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
      const config = generativeParameters.friendliai();
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
      const config = generativeParameters.friendliai({
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
      const config = generativeParameters.mistral();
      expect(config).toEqual<
        ModuleConfig<'generative-mistral', GenerativeConfigRuntimeType<'generative-mistral'> | undefined>
      >({
        name: 'generative-mistral',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.mistral({
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
      const config = generativeParameters.nvidia();
      expect(config).toEqual<
        ModuleConfig<'generative-nvidia', GenerativeConfigRuntimeType<'generative-nvidia'> | undefined>
      >({
        name: 'generative-nvidia',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.nvidia({
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
      const config = generativeParameters.ollama();
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
      const config = generativeParameters.openAI();
      expect(config).toEqual<
        ModuleConfig<'generative-openai', GenerativeConfigRuntimeType<'generative-openai'>>
      >({
        name: 'generative-openai',
        config: { isAzure: false },
      });
    });
    it('with values', () => {
      const config = generativeParameters.openAI({
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

  describe('xai', () => {
    it('with defaults', () => {
      const config = generativeParameters.xai();
      expect(config).toEqual<
        ModuleConfig<'generative-xai', GenerativeConfigRuntimeType<'generative-xai'> | undefined>
      >({
        name: 'generative-xai',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.xai({
        baseURL: 'http://localhost:8080',
        maxTokens: 100,
        model: 'model',
        temperature: 0.5,
        topP: 0.9,
      });
      expect(config).toEqual<
        ModuleConfig<'generative-xai', GenerativeConfigRuntimeType<'generative-xai'> | undefined>
      >({
        name: 'generative-xai',
        config: {
          baseUrl: 'http://localhost:8080',
          maxTokens: 100,
          model: 'model',
          temperature: 0.5,
          topP: 0.9,
        },
      });
    });
  });

  describe('contextualai', () => {
    it('with defaults', () => {
      const config = generativeParameters.contextualai();
      expect(config).toEqual<
        ModuleConfig<
          'generative-contextualai',
          GenerativeConfigRuntimeType<'generative-contextualai'> | undefined
        >
      >({
        name: 'generative-contextualai',
        config: undefined,
      });
    });
    it('with values', () => {
      const config = generativeParameters.contextualai({
        model: 'v2',
        maxNewTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        systemPrompt: 'sys',
        avoidCommentary: false,
        knowledge: ['knowledge1', 'knowledge2'],
      });
      expect(config).toEqual<
        ModuleConfig<
          'generative-contextualai',
          GenerativeConfigRuntimeType<'generative-contextualai'> | undefined
        >
      >({
        name: 'generative-contextualai',
        config: {
          model: 'v2',
          temperature: 0.7,
          topP: 0.9,
          maxNewTokens: 512,
          systemPrompt: 'sys',
          avoidCommentary: false,
          knowledge: { values: ['knowledge1', 'knowledge2'] },
        },
      });
    });
  });
});
