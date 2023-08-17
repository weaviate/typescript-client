// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export type QueryProperties<P> = {
  [Property in keyof P]?: boolean;
};

export type QueryFields<P> = QueryProperties<P> & {
  _additional?: {
    certainty?: boolean;
    classification?: boolean;
    creationTimeUnix?: boolean;
    distance?: boolean;
    explainScore?: boolean;
    group?: {
      count?: boolean;
      groupedBy?: {
        path?: boolean;
        value?: boolean;
      };
      hits?: QueryProperties<P> & {
        _additional?: {
          distance?: boolean;
          id?: boolean;
          vector?: boolean;
        };
      };
      id?: boolean;
      maxDistance?: boolean;
      minDistance?: boolean;
    };
    id?: boolean;
    lastUpdateTimeUnix?: boolean;
    score?: boolean;
    vector?: boolean;
  };
};

export function isQueryFields(obj: any): obj is QueryFields<any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isQueryProperties<P extends Record<string, any>>(obj: any): obj is QueryProperties<P> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function parseQueryProperties<P extends Record<string, any>>(obj: QueryProperties<P>): string[] {
  return Object.keys(obj).filter((key) => obj[key]);
}

export function parseProperties<P extends Record<string, any>>(obj: string[] | QueryProperties<P>): string[] {
  return isQueryProperties(obj) ? parseQueryProperties(obj) : obj;
}
