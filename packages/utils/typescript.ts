export type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer R>
    ? Array<NestedPartial<R>>
    : NestedPartial<T[K]>;
};

// @see https://stackoverflow.com/questions/41285211/overriding-interface-property-type-defined-in-typescript-d-ts-file
// Let's you override some types
export type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;
