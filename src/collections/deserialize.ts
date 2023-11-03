import { MetadataResult, PropertiesResult } from '../proto/v1/search_get';
import { MetadataReturn } from './types';

export interface PropertiesGrpc {
  nonRefProperties?: {
    [key: string]: any;
  };
  textArrayProperties: {
    propName: string;
    values: string[];
  }[];
  intArrayProperties: {
    propName: string;
    values: number[];
  }[];
  numberArrayProperties: {
    propName: string;
    values: number[];
  }[];
  booleanArrayProperties: {
    propName: string;
    values: boolean[];
  }[];
  objectProperties: {
    propName: string;
    value?: PropertiesGrpc;
  }[];
  objectArrayProperties: {
    propName: string;
    values: PropertiesGrpc[];
  }[];
}

export default class Deserialize {
  static properties<T extends Record<string, any>>(properties: PropertiesResult): T {
    const out = this.objectProperties(properties);
    properties.refProps.forEach((property) => {
      out[property.propName] = property.properties.map((property) => this.properties(property));
    });
    return out as T;
  }

  static objectProperties(properties: PropertiesGrpc): Record<string, any> {
    const out: Record<string, any> = {};
    if (properties.nonRefProperties) {
      Object.entries(properties.nonRefProperties).forEach(([key, value]) => {
        out[key] = value;
      });
    }
    properties.textArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.intArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.numberArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.booleanArrayProperties.forEach((property) => {
      out[property.propName] = property.values;
    });
    properties.objectProperties.forEach((property) => {
      if (!property.value) return;
      out[property.propName] = this.objectProperties(property.value);
    });
    properties.objectArrayProperties.forEach((property) => {
      out[property.propName] = property.values.map((value) => this.objectProperties(value));
    });
    return out;
  }

  static metadata(metadata: MetadataResult): MetadataReturn {
    return {
      uuid: metadata.id.length > 0 ? metadata.id : undefined,
      vector: metadata.vector.length > 0 ? metadata.vector : undefined,
      distance: metadata.distancePresent ? metadata.distance : undefined,
      certainty: metadata.certaintyPresent ? metadata.certainty : undefined,
      creationTimeUnix: metadata.creationTimeUnixPresent ? metadata.creationTimeUnix : undefined,
      lastUpdateTimeUnix: metadata.lastUpdateTimeUnixPresent ? metadata.lastUpdateTimeUnix : undefined,
      score: metadata.scorePresent ? metadata.score : undefined,
      explainScore: metadata.explainScorePresent ? metadata.explainScore : undefined,
      isConsistent: metadata.isConsistent,
    };
  }
}
