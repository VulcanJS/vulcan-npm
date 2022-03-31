/**
 * Vulcan do not use all features of simpl-schema anymore,
 * only a simplified version
 */

type Integer = RegExp;

type SchemaType =
  | String
  | Number
  | Integer
  | Boolean
  | Object
  | ArrayLike<any>
  | SchemaDefinition<any>
  | Date;
//| SimpleSchema
//| SimpleSchemaGroup;

type SimpleSchemaGroup = { definitions: ArrayLike<{ type: SchemaType }> };

interface CleanOption {
  filter?: boolean;
  autoConvert?: boolean;
  removeEmptyStrings?: boolean;
  trimStrings?: boolean;
  getAutoValues?: boolean;
  isModifier?: boolean;
  extendAutoValueContext?: boolean;
}

export type AutoValueFunctionSelf<T> = {
  key: string;
  closestSubschemaFieldName: string | null;
  isSet: boolean;
  unset: () => void;
  value: T; // | Mongo.Modifier<T>;
  operator: string;
  field(otherField: string): {
    isSet: boolean;
    value: any;
    operator: string;
  };
  siblingField(otherField: string): {
    isSet: boolean;
    value: any;
    operator: string;
  };
  parentField(otherField: string): {
    isSet: boolean;
    value: any;
    operator: string;
  };
};

type ValidationError = {
  name: string;
  type: string;
  value: any;
};

type AutoValueFunction<T> = (this: AutoValueFunctionSelf<T>) => T | undefined;

interface ValidationFunctionSelf<T> {
  value: T;
  key: string;
  genericKey: string;
  definition: SchemaDefinition<T>;
  isSet: boolean;
  operator: any;
  //validationContext: ValidationContext;
  field: (fieldName: string) => any;
  siblingField: (fieldName: string) => any;
  addValidationErrors: (errors: ValidationError[]) => {};
}

type ValidationFunction = (
  this: ValidationFunctionSelf<any>
) => string | undefined;

export interface SchemaDefinition<T> {
  type: SchemaType;
  label?: string; // | Function;
  optional?: boolean; // | Function;
  min?: number | boolean | Date; // | Function;
  max?: number | boolean | Date; // | Function;
  minCount?: number; // | Function;
  maxCount?: number; // | Function;
  allowedValues?: any[]; // | Function;
  decimal?: boolean;
  exclusiveMax?: boolean;
  exclusiveMin?: boolean;
  regEx?: RegExp | RegExp[];
  custom?: ValidationFunction;
  blackbox?: boolean;
  autoValue?: AutoValueFunction<T>;
  defaultValue?: any;
  trim?: boolean;

  // allow custom extensions
  [key: string]: any;
}

export interface EvaluatedSchemaDefinition {
  type: ArrayLike<{ type: SchemaType }>;
  label?: string;
  optional?: boolean;
  min?: number | boolean | Date;
  max?: number | boolean | Date;
  minCount?: number;
  maxCount?: number;
  allowedValues?: any[];
  decimal?: boolean;
  exclusiveMax?: boolean;
  exclusiveMin?: boolean;
  regEx?: RegExp | RegExp[];
  blackbox?: boolean;
  defaultValue?: any;
  trim?: boolean;

  // allow custom extensions
  [key: string]: any;
}

interface ValidationOption {
  modifier?: boolean;
  upsert?: boolean;
  clean?: boolean;
  filter?: boolean;
  upsertextendedCustomContext?: boolean;
  extendedCustomContext: any;
}

interface SimpleSchemaValidationContext {
  validate(obj: any, options?: ValidationOption): boolean;

  validateOne(doc: any, keyName: string, options?: ValidationOption): boolean;

  resetValidation(): void;

  isValid(): boolean;

  invalidKeys(): { name: string; type: string; value?: any }[];

  addInvalidKeys(errors: ValidationError[]): void;

  keyIsInvalid(name: any): boolean;

  keyErrorMessage(name: any): string;

  getErrorObject(): any;

  validationErrors(): Array<{ type?: string; name?: string }>;
}

interface MongoObjectStatic {
  forEachNode(func: Function, options?: { endPointsOnly: boolean }): void;

  getValueForPosition(position: string): any;

  setValueForPosition(position: string, value: any): void;

  removeValueForPosition(position: string): void;

  getKeyForPosition(position: string): any;

  getGenericKeyForPosition(position: string): any;

  getInfoForKey(key: string): any;

  getPositionForKey(key: string): string;

  getPositionsForGenericKey(key: string): string[];

  getValueForKey(key: string): any;

  addKey(key: string, val: any, op: string): any;

  removeGenericKeys(keys: string[]): void;

  removeGenericKey(key: string): void;

  removeKey(key: string): void;

  removeKeys(keys: string[]): void;

  filterGenericKeys(test: Function): void;

  setValueForKey(key: string, val: any): void;

  setValueForGenericKey(key: string, val: any): void;

  getObject(): any;

  getFlatObject(options?: { keepArrays?: boolean }): any;

  affectsKey(key: string): any;

  affectsGenericKey(key: string): any;

  affectsGenericKeyImplicit(key: string): any;
}

interface MongoObject {
  expandKey(val: any, key: string, obj: any): void;
}
