import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { VulcanDocument } from "@vulcanjs/schema";
import React from "react";
import { useVulcanComponents } from "../VulcanComponents";

const getTypeName = (value, fieldName, collection) => {
  const schema = collection && collection.simpleSchema()._schema;
  const fieldSchema = schema && schema[fieldName];
  if (fieldSchema) {
    const type = fieldSchema.type.singleType;
    const typeName = typeof type === "function" ? type.name : type;
    return typeName;
  } else {
    return typeof value;
  }
};

const getFieldSchema = (fieldName: string, model: VulcanGraphqlModel) => {
  const schema = model.schema;
  const fieldSchema = schema && schema[fieldName];
  return fieldSchema;
};

export interface CellProps {
  nestingLevel?: number;
  value?: any;
  typeName?: string;
  contents?: any;
  fieldName?: string;
  model?: VulcanGraphqlModel;
  document?: VulcanDocument;
}
/**
 * Also used by the DataTable to render each cell
 *
 * TODO: move to its own "Cell" folder
 * TODO: nesting and relations are not yet very well handled
 * @param props
 * @returns
 */
export const CardItemSwitcher = (props: CellProps) => {
  const Components = useVulcanComponents();
  // if typeName is not provided, default to typeof value
  // note: contents provides additional clues about the contents (image, video, etc.)

  const {
    nestingLevel = 0,
    value,
    contents,
    fieldName,
    document,
    model,
  } = props;
  let { typeName } = props;

  // NOTE: we don't necessarilly have a model or schema, eg when nesting the render
  const fieldSchema =
    model && fieldName ? getFieldSchema(fieldName, model) : undefined;

  if (!typeName) {
    if (model) {
      typeName = getTypeName(value, fieldName, model);
    } else {
      typeName = typeof value;
    }
  }

  const itemProps: Pick<
    CellProps,
    "nestingLevel" | "value" | "document" | "fieldName" | "model"
  > & {
    fieldSchema?: VulcanFieldSchema;
    relatedFieldName?: string;
    relatedDocument?: any;
    relatedModel?: VulcanGraphqlModel;
  } = {
    nestingLevel: nestingLevel + 1,
    value,
    document,
    fieldName,
    model,
    fieldSchema,
  };

  // no value; we return an empty string
  if (typeof value === "undefined" || value === null) {
    return <>""</>;
  }

  // JSX element
  if (React.isValidElement(value)) {
    return value;
  }

  // Relation
  if (fieldSchema && fieldSchema.resolveAs && fieldSchema.resolveAs.relation) {
    itemProps.relatedFieldName =
      //fieldSchema.resolveAs?.fieldName ||
      fieldSchema.relation?.fieldName || fieldName;
    itemProps.relatedDocument = document?.[itemProps.relatedFieldName || ""];
    // TODO: typing is not good
    // @ts-ignore
    itemProps.relatedModel = fieldSchema.relation?.model;
    // TODO: how to get the model from a resolveAs or relation?
    /*
    itemProps.relatedCollection = getCollectionByTypeName(
      fieldSchema.resolveAs.typeName || fieldSchema.resolveAs.type
    );*/

    if (!itemProps.relatedDocument) {
      return (
        <span>
          Missing data for sub-document <code>{value}</code> of type{" "}
          <code>{typeName}</code> (<code>{itemProps.relatedFieldName}</code>)
        </span>
      );
    }

    switch (fieldSchema.relation?.kind) {
      case "hasOne":
        return <Components.CardItemRelationHasOne {...itemProps} />;

      case "hasMany":
        return <Components.CardItemRelationHasMany {...itemProps} />;

      default:
        return <Components.CardItemDefault {...itemProps} />;
    }
  }

  // Array
  if (Array.isArray(value)) {
    typeName = "Array";
  }

  switch (typeName) {
    case "Boolean":
    case "boolean":
    case "Number":
    case "number":
    case "SimpleSchema.Integer":
      return <Components.CardItemNumber {...itemProps} />;

    case "Array":
      return <Components.CardItemArray {...itemProps} />;

    case "Object":
    case "object":
      return <Components.CardItemObject {...itemProps} />;

    case "Date":
      return <Components.CardItemDate {...itemProps} />;

    case "String":
    case "string":
      switch (contents) {
        case "html":
          return <Components.CardItemHTML {...itemProps} />;

        case "date":
          return <Components.CardItemDate {...itemProps} />;

        case "image":
          return <Components.CardItemImage {...itemProps} force={true} />;

        case "url":
          return <Components.CardItemURL {...itemProps} force={true} />;

        default:
          // still attempt to parse string as an image or URL if possible
          return <Components.CardItemImage {...itemProps} />;
      }

    default:
      return <Components.CardItemDefault {...itemProps} />;
  }
};
