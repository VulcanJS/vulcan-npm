export * from "./connector";
export interface ContextWithUser {
  currentUser?: any;
  [key: string]: any;
}

// TODO: this also belong more to the concept of "Model" than "Schema"
export interface RelationDefinition {
  fieldName: string;
  typeName: string;
  kind: "hasOne" | "hasMany";
}
