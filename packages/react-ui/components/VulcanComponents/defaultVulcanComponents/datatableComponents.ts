import { DatatableComponents } from "../typings";

import {
  Datatable,
  DatatableAbove,
  DatatableAboveLayout,
  DatatableAboveLeft,
  DatatableAboveRight,
  DatatableAboveSearchInput,
  DatatableLayout,
} from "../../Datatable/Datatable";
import {
  DatatableContents,
  DatatableContentsBodyLayout,
  DatatableContentsHeadLayout,
  DatatableContentsInnerLayout,
  DatatableContentsLayout,
  DatatableContentsMoreLayout,
  DatatableEmpty,
  DatatableLoadMoreButton,
  DatatableTitle,
} from "../../Datatable/DatatableContents";
import {
  DatatableHeader,
  DatatableHeaderCellLayout,
} from "../../Datatable/DatatableHeader";
import { DatatableRow, DatatableRowLayout } from "../../Datatable/DatatableRow";
import {
  DatatableCell,
  DatatableCellLayout,
  DatatableDefaultCell,
} from "../../Datatable/DatatableCell";
import {
  DatatableFilter,
  DatatableFilterBooleans,
  DatatableFilterCheckboxes,
  DatatableFilterContents,
  DatatableFilterContentsWithData,
  DatatableFilterDates,
  DatatableFilterNumbers,
} from "../../Datatable/DatatableFilter";
import { DatatableSorter } from "../../Datatable/DatatableSorter";
import { DatatableSelect } from "../../Datatable/DatatableSelect";
import { DatatableSubmitSelected } from "../../Datatable/DatatableSubmitSelected";
import { EditButton, EditForm } from "../../Datatable/others/EditButton";
import { NewButton, NewForm } from "../../Datatable/others/NewButton";
import { DeleteButton } from "../../Datatable/others/DeleteButton";

export const defaultDatatableComponents: DatatableComponents = {
  Datatable: Datatable,
  // DatatableContents:   DatatableContents
  DatatableAbove: DatatableAbove,
  DatatableAboveLayout: DatatableAboveLayout,
  DatatableAboveLeft: DatatableAboveLeft,
  DatatableAboveRight: DatatableAboveRight,
  DatatableAboveSearchInput: DatatableAboveSearchInput,
  DatatableLayout: DatatableLayout,
  // Contents
  DatatableContents: DatatableContents,
  DatatableContentsBodyLayout: DatatableContentsBodyLayout,
  DatatableContentsHeadLayout: DatatableContentsHeadLayout,
  DatatableContentsInnerLayout: DatatableContentsInnerLayout,
  DatatableContentsLayout: DatatableContentsLayout,
  DatatableContentsMoreLayout: DatatableContentsMoreLayout,
  DatatableEmpty: DatatableEmpty,
  DatatableLoadMoreButton: DatatableLoadMoreButton,
  DatatableTitle: DatatableTitle,
  // Header
  DatatableHeader: DatatableHeader,
  DatatableHeaderCellLayout: DatatableHeaderCellLayout,
  // Row
  DatatableRow: DatatableRow,
  DatatableRowLayout: DatatableRowLayout,
  // Cell
  DatatableCell: DatatableCell,
  DatatableCellLayout: DatatableCellLayout,
  DatatableDefaultCell: DatatableDefaultCell,
  //  Filter
  DatatableFilter: DatatableFilter,
  DatatableFilterBooleans: DatatableFilterBooleans,
  DatatableFilterCheckboxes: DatatableFilterCheckboxes,
  DatatableFilterContents: DatatableFilterContents,
  DatatableFilterContentsWithData: DatatableFilterContentsWithData,
  DatatableFilterDates: DatatableFilterDates,
  DatatableFilterNumbers: DatatableFilterNumbers,
  // Sort
  DatatableSorter: DatatableSorter,
  // Select
  DatatableSelect: DatatableSelect,
  // SubmitSelect
  DatatableSubmitSelected: DatatableSubmitSelected,
  // Core
  EditButton: EditButton,
  EditForm: EditForm,
  NewButton: NewButton,
  NewForm: NewForm,
  DeleteButton: DeleteButton,
};
