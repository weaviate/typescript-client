import { isValidStringProperty } from '../validation/string';
import { DbVersionSupport } from '../utils/dbVersion';

const objectsPathPrefix = '/objects';

export class ObjectsPath {
  private dbVersionSupport: DbVersionSupport;

  constructor(dbVersionSupport: DbVersionSupport) {
    this.dbVersionSupport = dbVersionSupport;
  }

  buildCreate(consistencyLevel: string | undefined): Promise<string> {
    return this.build({ consistencyLevel }, [this.addQueryParams]);
  }
  buildDelete(
    id: string,
    className: string,
    consistencyLevel: string | undefined
  ): Promise<string> {
    return this.build({ id, className, consistencyLevel }, [
      this.addClassNameDeprecatedNotSupportedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildCheck(id: string, className: string): Promise<string> {
    return this.build({ id, className }, [
      this.addClassNameDeprecatedNotSupportedCheck,
      this.addId,
    ]);
  }
  buildGetOne(
    id: string,
    className: string,
    additionals: any,
    consistencyLevel: string | undefined,
    nodeName: any
  ): Promise<string> {
    return this.build(
      { id, className, additionals, consistencyLevel, nodeName },
      [
        this.addClassNameDeprecatedNotSupportedCheck,
        this.addId,
        this.addQueryParams,
      ]
    );
  }
  buildGet(
    className: string | undefined,
    limit: any,
    additionals: any,
    after: string
  ): Promise<string> {
    return this.build({ className, limit, additionals, after }, [
      this.addQueryParamsForGet,
    ]);
  }
  buildUpdate(
    id: string,
    className: string,
    consistencyLevel: string | undefined
  ): Promise<string> {
    return this.build({ id, className, consistencyLevel }, [
      this.addClassNameDeprecatedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }
  buildMerge(
    id: string,
    className: string,
    consistencyLevel: string | undefined
  ): Promise<string> {
    return this.build({ id, className, consistencyLevel }, [
      this.addClassNameDeprecatedCheck,
      this.addId,
      this.addQueryParams,
    ]);
  }

  build(params: any, modifiers: any): Promise<string> {
    return this.dbVersionSupport
      .supportsClassNameNamespacedEndpointsPromise()
      .then((support: any) => {
        let path = objectsPathPrefix;
        modifiers.forEach((modifier: any) => {
          path = modifier(params, path, support);
        });
        return path;
      });
  }

  addClassNameDeprecatedNotSupportedCheck(
    params: any,
    path: string,
    support: any
  ) {
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
    if (Array.isArray(params.additionals) && params.additionals.length > 0) {
      queryParams.push(`include=${params.additionals.join(',')}`);
    }
    if (isValidStringProperty(params.nodeName)) {
      queryParams.push(`node_name=${params.nodeName}`);
    }
    if (isValidStringProperty(params.consistencyLevel)) {
      queryParams.push(`consistency_level=${params.consistencyLevel}`);
    }
    if (queryParams.length > 0) {
      return `${path}?${queryParams.join('&')}`;
    }
    return path;
  }
  addQueryParamsForGet(params: any, path: string, support: any) {
    const queryParams = [];
    if (Array.isArray(params.additionals) && params.additionals.length > 0) {
      queryParams.push(`include=${params.additionals.join(',')}`);
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
    consistencyLevel: string
  ): Promise<string> {
    return this.dbVersionSupport
      .supportsClassNameNamespacedEndpointsPromise()
      .then((support: any) => {
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
        if (isValidStringProperty(id)) {
          path = `${path}/${id}`;
        }
        path = `${path}/references`;
        if (isValidStringProperty(property)) {
          path = `${path}/${property}`;
        }
        if (isValidStringProperty(consistencyLevel)) {
          path = `${path}?consistency_level=${consistencyLevel}`;
        }
        return path;
      });
  }
}
