/**
 * Used by DataTable and Cards
 */
import { CellComponents, defaultCellComponents } from "@vulcanjs/react-ui";
import { CardItemSwitcher } from "../../cell/CardItem";
import {
  CardItemRelationItem,
  DefaultCell,
  UserCell,
} from "../../cell/CardItemRelationItem";
import { CardItemArray } from "../../cell/CardItemArray";
import { CardItemDate } from "../../cell/CardItemDate";
import { CardItemDefault } from "../../cell/CardItemDefault";
import { CardItemHTML } from "../../cell/CardItemHTML";
import { CardItemImage } from "../../cell/CardItemImage";
import { CardItemNumber } from "../../cell/CardItemNumber";
import { CardItemObject } from "../../cell/CardItemObject";
import { CardItemRelationHasMany } from "../../cell/CardItemRelationHasMany";
import { CardItemRelationHasOne } from "../../cell/CardItemRelationHasOne";
import { CardItemString } from "../../cell/CardItemString";
import { CardItemURL } from "../../cell/CardItemURL";

export const liteCellComponents: CellComponents = {
  ...defaultCellComponents,
  CardItemSwitcher: CardItemSwitcher,
  CardItem: CardItemSwitcher,
  DefaultCell: DefaultCell,
  UserCell: UserCell,
  CardItemArray: CardItemArray,
  CardItemDate: CardItemDate,
  CardItemDefault: CardItemDefault,
  CardItemHTML: CardItemHTML,
  CardItemImage: CardItemImage,
  CardItemNumber: CardItemNumber,
  CardItemObject: CardItemObject,
  CardItemRelationHasMany: CardItemRelationHasMany,
  CardItemRelationHasOne: CardItemRelationHasOne,
  CardItemRelationItem: CardItemRelationItem,
  CardItemString: CardItemString,
  CardItemURL: CardItemURL,
};
