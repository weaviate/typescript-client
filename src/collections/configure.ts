import {
  GenerativeAzureOpenAIArgs,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereArgs,
  GenerativeCohereConfig,
  GenerativeOpenAIArgs,
  GenerativeOpenAIConfig,
  GenerativePaLMArgs,
  GenerativePaLMConfig,
  Img2VecNeuralArgs,
  Img2VecNeuralConfig,
  Multi2VecBindArgs,
  Multi2VecBindConfig,
  Multi2VecClipArgs,
  Multi2VecClipConfig,
  MultiTenancyConfig,
  Ref2VecCentroidArgs,
  Ref2VecCentroidConfig,
  Text2VecCohereArgs,
  Text2VecCohereConfig,
  Text2VecContextionaryArgs,
  Text2VecContextionaryConfig,
  Text2VecOpenAIArgs,
  Text2VecOpenAIConfig,
} from './types';

class Vectorizer {
  static img2VecNeural = (args?: Img2VecNeuralArgs): Img2VecNeuralConfig => {
    return {
      'img2vec-neural': args ? args : {},
    };
  };

  static multi2VecBind = (args?: Multi2VecBindArgs): Multi2VecBindConfig => {
    return {
      'multi2vec-bind': args ? args : {},
    };
  };

  static multi2VecClip = (args?: Multi2VecClipArgs): Multi2VecClipConfig => {
    return {
      'multi2vec-clip': args ? args : {},
    };
  };

  static ref2VecCentroid = (args: Ref2VecCentroidArgs): Ref2VecCentroidConfig => {
    return {
      'ref2vec-centroid': args,
    };
  };

  static text2VecCohere = (args?: Text2VecCohereArgs): Text2VecCohereConfig => {
    return {
      'text2vec-cohere': args ? args : {},
    };
  };

  static text2VecContextionary = (args?: Text2VecContextionaryArgs): Text2VecContextionaryConfig => {
    return {
      'text2vec-contextionary': args ? args : {},
    };
  };

  static text2VecOpenAI = (args?: Text2VecOpenAIArgs): Text2VecOpenAIConfig => {
    return {
      'text2vec-openai': args ? args : {},
    };
  };
}

class Generative {
  static azureOpenai = (args: GenerativeAzureOpenAIArgs): GenerativeAzureOpenAIConfig => {
    return {
      'generative-openai': args,
    };
  };

  static cohere = (args?: GenerativeCohereArgs): GenerativeCohereConfig => {
    return {
      'generative-cohere': args ? args : {},
    };
  };

  static openai = (args?: GenerativeOpenAIArgs): GenerativeOpenAIConfig => {
    return {
      'generative-openai': args ? args : {},
    };
  };

  static palm = (args: GenerativePaLMArgs): GenerativePaLMConfig => {
    return {
      'generative-palm': args,
    };
  };
}

export default class Configure {
  static Vectorizer = Vectorizer;
  static Generative = Generative;

  static multiTenancy = (args: { enabled: boolean }): MultiTenancyConfig => {
    return args;
  };
}
