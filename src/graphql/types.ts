// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export type ObjectQueryFields<P> = {
  [Property in keyof P]?: boolean;
};

export type QueryFields<P> = ObjectQueryFields<P> & {
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
      hits?: ObjectQueryFields<P> & {
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

export function isObjectQueryFields<P extends Record<string, any>>(obj: any): obj is ObjectQueryFields<P> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function parseObjectQueryFields<P extends Record<string, any>>(obj: ObjectQueryFields<P>): string[] {
  return Object.keys(obj).filter((key) => obj[key]);
}
