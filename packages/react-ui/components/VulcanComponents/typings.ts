import React from "react";
// Load only the type, to define the API for each component
// TODO: maybe do the reverse, define the props here and an unstyled version of the component?
import type { FormSubmitProps } from "../form/FormSubmit";
import type { ButtonProps } from "../form/core/Button";
import type { MutationButtonProps } from "../MutationButton";
import type {
  Datatable,
  DatatableAbove,
  DatatableAboveLayout,
  DatatableAboveLeft,
  DatatableAboveRight,
  DatatableAboveSearchInput,
  DatatableLayout,
} from "../Datatable/Datatable";
import type {
  DatatableContents,
  DatatableContentsBodyLayout,
  DatatableContentsHeadLayout,
  DatatableContentsInnerLayout,
  DatatableContentsLayout,
  DatatableContentsMoreLayout,
  DatatableEmpty,
  DatatableLoadMoreButton,
  DatatableTitle,
} from "../Datatable/DatatableContents";
import type {
  DatatableHeader,
  DatatableHeaderCellLayout,
} from "../Datatable/DatatableHeader";
import type {
  DatatableRow,
  DatatableRowLayout,
} from "../Datatable/DatatableRow";
import type {
  DatatableCell,
  DatatableCellLayout,
  DatatableDefaultCell,
} from "../Datatable/DatatableCell";
import type {
  DatatableFilter,
  DatatableFilterBooleans,
  DatatableFilterCheckboxes,
  DatatableFilterContents,
  DatatableFilterContentsWithData,
  DatatableFilterDates,
  DatatableFilterNumbers,
} from "../Datatable/DatatableFilter";
import type { DatatableSorter } from "../Datatable/DatatableSorter";
import type { DatatableSelect } from "../Datatable/DatatableSelect";
import type { DatatableSubmitSelected } from "../Datatable/DatatableSubmitSelected";
import type { EditButton, EditForm } from "../Datatable/others/EditButton";
import type { NewButton, NewForm } from "../Datatable/others/NewButton";
import type { CardItemSwitcher } from "../cell/CardItem";
import type {
  CardItemRelationItem,
  DefaultCell,
  UserCell,
} from "../cell/CardItemRelationItem";
import type { CardItemArray } from "../cell/CardItemArray";
import type { CardItemDate } from "../cell/CardItemDate";
import type { CardItemDefault } from "../cell/CardItemDefault";
import type { CardItemHTML } from "../cell/CardItemHTML";
import type { CardItemImage } from "../cell/CardItemImage";
import type { CardItemNumber } from "../cell/CardItemNumber";
import type { CardItemObject } from "../cell/CardItemObject";
import type { CardItemRelationHasMany } from "../cell/CardItemRelationHasMany";
import type { CardItemRelationHasOne } from "../cell/CardItemRelationHasOne";
import type { CardItemString } from "../cell/CardItemString";
import type { CardItemURL } from "../cell/CardItemURL";
import { DeleteButton } from "../Datatable/others/DeleteButton";
import { BootstrapModal as Modal } from "../bootstrap/Modal";

export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: React.ComponentType<ButtonProps>;
  Icon: any;
  // TODO: define props more precisely
  MutationButton: React.ComponentType<MutationButtonProps>;
  LoadingButton: React.ComponentType<any>;
  HeadTags: React.ComponentType<any>;
  // Previously from Bootstrap and Mui
  TooltipTrigger: React.ComponentType<any>;
  Dropdown: React.ComponentType<any>;
  Modal: typeof Modal;
}
// TODO: differentiate components that are provided out of the box and those that require a UI frameworK?
export interface PossibleFormComponents {
  FormError: any; // FieldErrors
  // From FormComponent
  FormComponentDefault: any;
  FormComponentPassword: any;
  FormComponentNumber: any;
  FormComponentUrl: any;
  FormComponentEmail: any;
  FormComponentTextarea: any;
  FormComponentCheckbox: any;
  FormComponentCheckboxGroup: any;
  FormComponentRadioGroup: any;
  FormComponentSelect: any;
  FormComponentSelectMultiple: any;
  FormComponentDateTime: any;
  FormComponentDate: any;
  // FormComponentDate2: any;
  FormComponentTime: any;
  FormComponentStaticText: any;
  FormComponentLikert: any;
  FormComponentAutocomplete: any;
  FormComponentMultiAutocomplete: any;
  //
  FormComponent: any;
  FormComponentInner: any;
  FormComponentLoader: any;
  FormElement: any;
  FormGroup: any;
  FormGroupLayout: any;
  FormGroupHeader: any;
  // intl
  FormIntlLayout: any;
  FormIntlItemLayout: any;
  FormIntl: any;
  // Layout
  FormErrors: any;
  FormSubmit: React.ComponentType<FormSubmitProps>;
  FormLayout: any;

  // arrays and objects
  FormNestedArray: any;
  FormNestedArrayInnerLayout: any;
  FormNestedArrayLayout: any;
  FormNestedItem: any;
  IconAdd: any;
  IconRemove: any;
  FieldErrors: any;
  FormNestedDivider: any;
  //
  FormNestedItemLayout: any;
  FormNestedObjectLayout: any;
  FormNestedObject: any;
  FormOptionLabel: any;
  // Form
  Form: any;
  // Used by ui-boostrap and ui-material
  FormItem;
  // flag to detect parent state
  __not_intialized?: boolean;
}

export interface DatatableComponents {
  Datatable: typeof Datatable;
  // DatatableContents: typeof DatatableContents
  DatatableAbove: typeof DatatableAbove;
  DatatableAboveLayout: typeof DatatableAboveLayout;
  DatatableAboveLeft: typeof DatatableAboveLeft;
  DatatableAboveRight: typeof DatatableAboveRight;
  DatatableAboveSearchInput: typeof DatatableAboveSearchInput;
  DatatableLayout: typeof DatatableLayout;
  // Contents
  DatatableContents: typeof DatatableContents;
  DatatableContentsBodyLayout: typeof DatatableContentsBodyLayout;
  DatatableContentsHeadLayout: typeof DatatableContentsHeadLayout;
  DatatableContentsInnerLayout: typeof DatatableContentsInnerLayout;
  DatatableContentsLayout: typeof DatatableContentsLayout;
  DatatableContentsMoreLayout: typeof DatatableContentsMoreLayout;
  DatatableEmpty: typeof DatatableEmpty;
  DatatableLoadMoreButton: typeof DatatableLoadMoreButton;
  DatatableTitle: typeof DatatableTitle;
  // Header
  DatatableHeader: typeof DatatableHeader;
  DatatableHeaderCellLayout: typeof DatatableHeaderCellLayout;
  // Row
  DatatableRow: typeof DatatableRow;
  DatatableRowLayout: typeof DatatableRowLayout;
  // Cell
  DatatableCell: typeof DatatableCell;
  DatatableCellLayout: typeof DatatableCellLayout;
  DatatableDefaultCell: typeof DatatableDefaultCell;
  //  Filter
  DatatableFilter: typeof DatatableFilter;
  DatatableFilterBooleans: typeof DatatableFilterBooleans;
  DatatableFilterCheckboxes: typeof DatatableFilterCheckboxes;
  DatatableFilterContents: typeof DatatableFilterContents;
  DatatableFilterContentsWithData: typeof DatatableFilterContentsWithData;
  DatatableFilterDates: typeof DatatableFilterDates;
  DatatableFilterNumbers: typeof DatatableFilterNumbers;
  // Sort
  DatatableSorter: typeof DatatableSorter;
  // Select
  DatatableSelect: typeof DatatableSelect;
  // SubmitSelect
  DatatableSubmitSelected: typeof DatatableSubmitSelected;
  // Core
  EditButton: typeof EditButton;
  EditForm: typeof EditForm;
  NewButton: typeof NewButton;
  NewForm: typeof NewForm;
  DeleteButton: typeof DeleteButton;
}

export interface CellComponents {
  CardItemSwitcher: typeof CardItemSwitcher;
  CardItem: typeof CardItemSwitcher;
  DefaultCell: typeof DefaultCell;
  UserCell: typeof UserCell;
  CardItemArray: typeof CardItemArray;
  CardItemDate: typeof CardItemDate;
  CardItemDefault: typeof CardItemDefault;
  CardItemHTML: typeof CardItemHTML;
  CardItemImage: typeof CardItemImage;
  CardItemNumber: typeof CardItemNumber;
  CardItemObject: typeof CardItemObject;
  CardItemRelationHasMany: typeof CardItemRelationHasMany;
  CardItemRelationHasOne: typeof CardItemRelationHasOne;
  CardItemRelationItem: typeof CardItemRelationItem;
  CardItemString: typeof CardItemString;
  CardItemURL: typeof CardItemURL;
}

export type PossibleVulcanComponents = PossibleCoreComponents &
  PossibleFormComponents &
  DatatableComponents &
  CellComponents;
