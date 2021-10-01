// Exports will be available at "@vulcanjs/mongo/client"
// Reexport the "filterFunction" that can be reused by Mingo client-side
// TODO: it may still leak mongoose client-side because of the typings, we need to check how to solve this
export * from "../mongoParams";
