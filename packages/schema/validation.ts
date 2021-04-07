export interface ValidationError {
  id: "errors.disallowed_property_detected" | string;
  path?: string;
  properties: {
    modelName?: string;
    name?: string; // field name
    [key: string]: any; // other error props
  };
}
