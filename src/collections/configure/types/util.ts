import { VectorizerConfigCreateType } from "./vectorizer.js";

/** KeyofNonEmpty removes `{}` from a union type and returns keys of all constituent types. */
type KeyofNonEmpty<T> = T extends object ? (keyof T extends never ? never : keyof T) : never;


/**
  * ParameterUnion extracts the type of the first argument for every function in object `T`
* then combines them in a union.
  */
type ParameterUnion<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Parameters<T[K]>[0] : never;
}[keyof T];


/**
  * RemoveConfiguration finds every function in object `T` and removes keys K from the type of it's first argument.
  *
  * This util assumes all of functions in `T` are either `{ opts: {...} }` or `{ opts?: {...} | undefined }` and is
* very brittle as a result. In fact, its only purpose is to allow reusing all the code underpinning the now-deprecated
* `configure.vectorizers` in `configure.vectors` while removing `vectorizeCollectionName` parameter from the latter.
   *
  * Usage (see: src/collections/configure/types/util.ts):
  *   vectors: vectors as RemoveConfiguration<typeof vectors, 'vectorizeCollectionName'>
  */
export type RemoveConfiguration<T, K extends KeyofNonEmpty<ParameterUnion<T>>> =
  T extends object
  ? {
    [F in keyof T]:

    // Handle functions with optional `opts?` argument.
    T[F] extends (opts?: infer Arg) => infer Ret
    // ? (opts?: Arg) => Ret
    ? (opts?: Omit<Arg, K>) => Ret

    // Handle functions with required `opts` argument.
    : T[F] extends (opts: infer Arg) => infer Ret
    // ? (opts: Arg) => Ret
    ? (opts: Omit<Arg, K>) => Ret

    : T[F];
  } : never;
