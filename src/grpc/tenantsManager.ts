import Base from './base.js';
import { Metadata } from 'nice-grpc';
import { WeaviateClient } from '../proto/v1/weaviate.js';
import { TenantsGetReply, TenantsGetRequest } from '../proto/v1/tenants.js';

export type TenantsGetArgs = {
  names?: string[];
};

export interface Tenants {
  withGet: (args: TenantsGetArgs) => Promise<TenantsGetReply>;
}

export default class TenantsManager extends Base implements TenantsManager {
  public static use(connection: WeaviateClient, collection: string, metadata: Metadata): Tenants {
    return new TenantsManager(connection, collection, metadata);
  }

  public withGet = (args: TenantsGetArgs) =>
    this.call(TenantsGetRequest.fromPartial({ names: { values: args.names } }));

  private call(message: TenantsGetRequest) {
    return this.connection.tenantsGet(
      {
        ...message,
        collection: this.collection,
      },
      {
        metadata: this.metadata,
      }
    );
  }
}
