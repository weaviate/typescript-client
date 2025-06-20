import { DbVersionSupport } from '../../utils/dbVersion.js';
import { isValidStringProperty } from '../../validation/string.js';
import { isValidWeaviateVersion } from '../../validation/version.js';
import { ConsistencyLevel } from './replication.js';

const objectsPathPrefix = '/objects';

export class ObjectsPath {
  private dbVersionSupport: DbVersionSupport;

  constructor(dbVersionSupport: DbVersionSupport) {
    this.dbVersionSupport = dbVersionSupport;
  }

  buildCreate(consistencyLevel?: string): Promise<string> {
    return this.build({ consistencyLevel }, [this.addQueryParams]);
  }
  buildDelete(id: string, className: string, consistencyLevel?: string, tenant?: string): Promise<string> {
    return this.build({ id, className, consistencyLevel, tenant: tenant }, [
      this.addClassNameDeprecatedNotSupportedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildCheck(
    id: string,
    className: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Promise<string> {
    return this.build({ id, className, consistencyLevel, tenant }, [
      this.addClassNameDeprecatedNotSupportedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildGetOne(
    id: string,
    className: string,
    additional: string[],
    consistencyLevel?: ConsistencyLevel,
    nodeName?: string,
    tenant?: string
  ): Promise<string> {
    return this.build({ id, className, additional: additional, consistencyLevel, nodeName, tenant: tenant }, [
      this.addClassNameDeprecatedNotSupportedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildGet(
    className?: string,
    limit?: number,
    additional?: string[],
    after?: string,
    tenant?: string
  ): Promise<string> {
    return this.build({ className, limit, additional, after, tenant: tenant }, [this.addQueryParamsForGet]);
  }
  buildUpdate(id: string, className: string, consistencyLevel?: string): Promise<string> {
    return this.build({ id, className, consistencyLevel }, [
      this.addClassNameDeprecatedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildMerge(id: string, className: string, consistencyLevel?: string): Promise<string> {
    return this.build({ id, className, consistencyLevel }, [
      this.addClassNameDeprecatedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }

  build(params: any, modifiers: any): Promise<string> {
    return this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise().then((support: any) => {
      let path = objectsPathPrefix;
      modifiers.forEach((modifier: any) => {
        path = modifier(params, path, support);
      });
      return path;
    });
  }

  addClassNameDeprecatedNotSupportedCheck(params: any, path: string, support: any) {
    if (support.supports) {
      if (isValidStringProperty(params.className)) {
        return `${path}/${params.className}`;
      } else {
        support.warns.deprecatedNonClassNameNamespacedEndpointsForObjects();
      }
    } else {
      support.warns.notSupportedClassNamespacedEndpointsForObjects();
    }
    return path;
  }
  addClassNameDeprecatedCheck(params: any, path: string, support: any) {
    if (support.supports) {
      if (isValidStringProperty(params.className)) {
        return `${path}/${params.className}`;
      } else {
        support.warns.deprecatedNonClassNameNamespacedEndpointsForObjects();
      }
    }
    return path;
  }
  addId(params: any, path: string) {
    if (isValidStringProperty(params.id)) {
      return `${path}/${params.id}`;
    }
    return path;
  }
  addQueryParams(params: any, path: string) {
    const queryParams = [];
    if (Array.isArray(params.additional) && params.additional.length > 0) {
      queryParams.push(`include=${params.additional.join(',')}`);
    }
    if (isValidStringProperty(params.nodeName)) {
      queryParams.push(`node_name=${params.nodeName}`);
    }
    if (isValidStringProperty(params.consistencyLevel)) {
      queryParams.push(`consistency_level=${params.consistencyLevel}`);
    }
    if (isValidStringProperty(params.tenant)) {
      queryParams.push(`tenant=${params.tenant}`);
    }
    if (queryParams.length > 0) {
      return `${path}?${queryParams.join('&')}`;
    }
    return path;
  }
  addQueryParamsForGet(params: any, path: string, support: any) {
    const queryParams = [];
    if (Array.isArray(params.additional) && params.additional.length > 0) {
      queryParams.push(`include=${params.additional.join(',')}`);
    }
    if (typeof params.limit == 'number' && params.limit > 0) {
      queryParams.push(`limit=${params.limit}`);
    }
    if (isValidStringProperty(params.className)) {
      if (support.supports) {
        queryParams.push(`class=${params.className}`);
      } else {
        support.warns.notSupportedClassParameterInEndpointsForObjects();
      }
    }
    if (isValidStringProperty(params.after)) {
      queryParams.push(`after=${params.after}`);
    }
    if (isValidStringProperty(params.tenant)) {
      queryParams.push(`tenant=${params.tenant}`);
    }
    if (queryParams.length > 0) {
      return `${path}?${queryParams.join('&')}`;
    }
    return path;
  }
}

export class ReferencesPath {
  private dbVersionSupport: DbVersionSupport;

  constructor(dbVersionSupport: DbVersionSupport) {
    this.dbVersionSupport = dbVersionSupport;
  }

  build(
    id: string,
    className: string,
    property: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Promise<string> {
    return this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise().then((support: any) => {
      let path = objectsPathPrefix;
      if (support.supports) {
        if (isValidStringProperty(className)) {
          path = `${path}/${className}`;
        } else {
          support.warns.deprecatedNonClassNameNamespacedEndpointsForReferences();
        }
      } else {
        support.warns.notSupportedClassNamespacedEndpointsForReferences();
      }
      if (support.version) {
        if (!isValidWeaviateVersion(support.version)) {
          support.warns.deprecatedWeaviateTooOld();
        }
      }
      if (isValidStringProperty(id)) {
        path = `${path}/${id}`;
      }
      path = `${path}/references`;
      if (isValidStringProperty(property)) {
        path = `${path}/${property}`;
      }
      const queryParams: Array<string> = [];
      if (isValidStringProperty(consistencyLevel)) {
        queryParams.push(`consistency_level=${consistencyLevel}`);
      }
      if (isValidStringProperty(tenant)) {
        queryParams.push(`tenant=${tenant}`);
      }
      if (queryParams.length > 0) {
        path = `${path}?${queryParams.join('&')}`;
      }
      return path;
    });
  }
}
