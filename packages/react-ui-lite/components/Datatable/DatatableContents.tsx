import React, { memo } from "react";
import _sortBy from "lodash/sortBy.js";
import type { VulcanGraphqlModel } from "@vulcanjs/graphql";

import { useVulcanComponents } from "@vulcanjs/react-ui";
import { DatatableSelectControlledProps } from "./DatatableSelect";

const wrapColumns = (c) => ({ name: c });

const getColumns = (columns, results, data) => {
  if (columns) {
    // convert all columns to objects
    const convertedColums = columns.map((column) =>
      typeof column === "object" ? column : { name: column }
    );
    const sortedColumns = _sortBy(convertedColums, (column) => column.order);
    return sortedColumns;
  } else if (results && results.length > 0) {
    // if no columns are provided, default to using keys of first array item
    return Object.keys(results[0])
      .filter((k) => k !== "__typename")
      .map(wrapColumns);
  } else if (data) {
    // note: withMulti HoC also passes a prop named data, but in this case
    // data should be the prop passed to the Datatable
    return Object.keys(data[0]).map(wrapColumns);
  }
  return [];
};

/*

DatatableContents Component

*/

export interface DatatableContentsProps
  extends Partial<DatatableSelectControlledProps> {
  title?: string;
  model: VulcanGraphqlModel;
  datatableData?: Array<any>;
  results?: Array<any>; // = [],
  columns?: Array<any>;
  loading?: boolean;
  // Function passed by the hook
  // TODO: get from a "typeof" on useQuzery instead
  loadMore?: any;
  networkStatus?: any;
  //
  count?: number;
  totalCount?: number;
  showEdit?: boolean;
  showDelete?: boolean;
  showNew?: boolean;
  currentUser?: any;
  toggleSort?: any;
  currentSort?: any;
  submitFilters?: any;
  currentFilters?: any;
  modalProps?: any;
  error?: any;
  showSelect?: boolean;
}

export const DatatableContents = (props: DatatableContentsProps) => {
  let {
    title = "",
    datatableData,
    results = [],
    columns,
    loading,
    loadMore,
    count = 0,
    totalCount = 0,
    networkStatus,
    showEdit,
    showDelete,
    currentUser,
    toggleSort,
    currentSort,
    submitFilters,
    currentFilters,
    modalProps,
    error,
    showSelect,
    model,
  } = props;
  const Components = useVulcanComponents();

  if (loading) {
    return (
      <div className="datatable-list datatable-list-loading">
        <Components.Loading />
      </div>
    );
  }

  const isLoadingMore = networkStatus === 2;
  const hasMore = results && totalCount > results.length;

  const sortedColumns = getColumns(columns, results, datatableData);

  return (
    <Components.DatatableContentsLayout>
      {/* note: we want to be able to show potential errors while still showing the data below */}
      {error && (
        <Components.Alert variant="danger">{error.message}</Components.Alert>
      )}
      {title && <Components.DatatableTitle title={title} />}
      <Components.DatatableContentsInnerLayout>
        <Components.DatatableContentsHeadLayout>
          {showSelect && <th />}
          {sortedColumns.map((column, index) => (
            <Components.DatatableHeader
              key={index}
              model={model}
              column={column}
              toggleSort={toggleSort}
              currentSort={currentSort}
              submitFilters={submitFilters}
              currentFilters={currentFilters}
            />
          ))}
          {showEdit ? (
            <th>
              <Components.FormattedMessage
                id="datatable.edit"
                defaultMessage="Edit"
              />
            </th>
          ) : null}
          {showDelete ? (
            <th>
              <Components.FormattedMessage
                id="datatable.delete"
                defaultMessage="Delete"
              />
            </th>
          ) : null}
        </Components.DatatableContentsHeadLayout>
        <Components.DatatableContentsBodyLayout>
          {results && results.length ? (
            results.map((document, index) => (
              <Components.DatatableRow
                {...props}
                model={model}
                columns={sortedColumns}
                document={document}
                key={index}
                showEdit={showEdit}
                showDelete={showDelete}
                currentUser={currentUser}
                modalProps={modalProps}
              />
            ))
          ) : (
            <Components.DatatableEmpty />
          )}
        </Components.DatatableContentsBodyLayout>
      </Components.DatatableContentsInnerLayout>
      {hasMore && (
        <Components.DatatableContentsMoreLayout>
          {isLoadingMore ? (
            <Components.Loading />
          ) : (
            <Components.DatatableLoadMoreButton
              count={count}
              totalCount={totalCount}
              onClick={(e) => {
                e.preventDefault();
                loadMore();
              }}
            >
              Load More ({count}/{totalCount})
            </Components.DatatableLoadMoreButton>
          )}
        </Components.DatatableContentsMoreLayout>
      )}
    </Components.DatatableContentsLayout>
  );
};
export const DatatableContentsLayout = ({ children }) => (
  <div className="datatable-list">{children}</div>
);

export const DatatableContentsInnerLayout = ({ children }) => (
  <table className="table">{children}</table>
);

export const DatatableContentsHeadLayout = ({ children }) => (
  <thead>
    <tr>{children}</tr>
  </thead>
);

export const DatatableContentsBodyLayout = ({ children }) => (
  <tbody>{children}</tbody>
);

export const DatatableContentsMoreLayout = ({ children }) => (
  <div className="datatable-list-load-more">{children}</div>
);

export const DatatableLoadMoreButton = ({
  count,
  totalCount,
  children,
  ...otherProps
}) => {
  const Components = useVulcanComponents();
  return (
    <Components.Button variant="primary" {...otherProps}>
      {children}
    </Components.Button>
  );
};
/*

DatatableTitle Component

*/
export const DatatableTitle = ({ title }) => (
  <div className="datatable-title">{title}</div>
);

/*

DatatableEmpty Component

*/
export const DatatableEmpty = () => {
  const Components = useVulcanComponents();
  return (
    <tr>
      <td colSpan={99}>
        <div style={{ textAlign: "center", padding: 10 }}>
          <Components.FormattedMessage
            id="datatable.empty"
            defaultMessage="No items to display."
          />
        </div>
      </td>
    </tr>
  );
};
