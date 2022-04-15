//import { Utils, registerComponent, getCollection } from "meteor/vulcan:lib";
import React, { useEffect, useState } from "react";
// import { intlShape } from "meteor/vulcan:i18n";
// import qs from "qs";
// import { withRouter } from "react-router";
//import compose from "recompose/compose";
import _isEmpty from "lodash/isEmpty.js";
import _set from "lodash/set.js";
import _cloneDeep from "lodash/cloneDeep.js";
//import withCurrentUser from "../../containers/currentUser.js";
//import withComponents from "../../containers/withComponents";
//import withMulti from "../../containers/multi2.js";
//import Users from "meteor/vulcan:users";
import _get from "lodash/get.js";
//import { getFieldType } from "../form/modules/utils";
import { useMulti } from "@vulcanjs/react-hooks";
import { VulcanModel } from "@vulcanjs/model";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import { isAdmin } from "@vulcanjs/permissions";
// NOTE: import from "CONSUMER" to avoid infinite loop
import { useVulcanComponents } from "../VulcanComponents/Consumer";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { permissionCheck } from "@vulcanjs/permissions";

const ascSortOperator = "asc";
const descSortOperator = "desc";

//const convertToBoolean = (s) => (s === "true" ? true : false);

/*

Datatable Component

*/

// see: http://stackoverflow.com/questions/1909441/jquery-keyup-delay
const delay = (function () {
  var timer: ReturnType<typeof setTimeout>;
  return function (callback, ms) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(callback, ms);
  };
})();

export interface DatatableProps<TData = any> {
  model: VulcanGraphqlModel;
  initialState?: any;
  /** Datatable will automatically alter the URL. Set to false when using more than 1 datatable on a page. */
  useUrlState?: boolean;

  title?: string;
  columns?: Array<any>;
  /** Force some data when using the datatable as a controlled input */
  data?: Array<TData>;
  options?: any;
  showEdit?: boolean;
  showDelete?: boolean;
  showNew?: boolean;
  showSearch?: boolean;
  newFormProps?: any;
  editFormProps?: any;
  rowClass?: any; //PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  // TODO: url management should happen via a hook, with the possibility to synchronize
  // or not the table based on the URL (in case we have 2 tables it must be disabled)
  location?: any; //PropTypes.shape({ search: PropTypes.string }).isRequired,
  // TODO: this props replace the direct calls to "history" to limit dependency to React router
  // it's type is similar to "history.push" from React router for the moment
  push: (options: { search?: string }) => void;

  currentUser?: any;
  modalProps?: any;
  onSubmitSelected?: any;
}

/**
 * TODO: currently we can only have one datable per page as they interact with the url directly
 * @param props
 * @returns
 */
export const Datatable = (props: DatatableProps) => {
  const [state, setState] = useState<any>({});
  const { initialState /*useUrlState, push*/ } = props;
  let initState: any = {
    searchValue: "",
    search: "",
    currentSort: {},
    currentFilters: {},
    selectedItems: [],
  };
  useEffect(() => {
    // initial state can be defined via props
    // note: this prop-originating initial state will *not* be reflected in the URL
    if (initialState) {
      if (initialState.search) {
        initState.searchValue = initialState.search;
        initState.search = initialState.search;
      }
      if (initialState.sort) {
        initState.currentSort = initialState.sort;
      }
      if (initialState.filter) {
        initState.currentFilters = initialState.filter;
      }
    }
    setState(initState);
  }, []);

  /** TODO: should be passed by the parent, we could expose helpers */
  /*
  const getUrlState = () => {
    const { location } = props;
    return qs.parse(location.search, { ignoreQueryPrefix: true });
  };*/

  /**
   * Convert url filter to number
   *
   * TODO: should be part of reusable hook
   * @param urlStateFilters
   * @returns
   */
  /*
  const convertToNumbers = (urlStateFilters) => {
    const convertedFilters = _cloneDeep(urlStateFilters);
    const { model } = props;

    // only try to convert when we have a collection schema
    if (model) {
      const schema = model.schema;

      Object.keys(urlStateFilters).forEach((fieldName) => {
        const field = schema[fieldName];
        const fieldType = getFieldType(field);
        const filter = urlStateFilters[fieldName];
        // the "operator" can be _in, _eq, _gte, etc.
        const [operator] = Object.keys(filter);
        const value = urlStateFilters[fieldName][operator];
        let convertedValue = value;
        // for each field, check if it's supposed to be a number
        if (fieldType === Number) {
          // value can be a single value or an array, depending on filter type
          convertedValue = Array.isArray(value)
            ? value.map(parseFloat)
            : parseFloat(value);
        } else if (fieldType === Boolean) {
          // value can be a single value or an array, depending on filter type
          convertedValue = Array.isArray(value)
            ? value.map(convertToBoolean)
            : convertToBoolean(value);
        }
        _set(convertedFilters, `${fieldName}.${operator}`, convertedValue);
      });
    }
    return convertedFilters;
  };*/

  // only load urlState if useUrlState is enabled
  /*
  if (useUrlState) {
    const urlState = getUrlState();
    if (urlState.search) {
      initState.searchValue = urlState.search;
      initState.search = urlState.search;
    }
    if (typeof urlState.sort === "string") {
      const [sortKey, sortValue] = urlState.sort.split("|");
      initState.currentSort = { [sortKey]: sortValue };
    }
    if (urlState.filter) {
      // all URL values are stored as strings, so convert them back to numbers if needed
      initState.currentFilters = convertToNumbers(urlState.filter);
    }
  }*/

  /*

  If useUrlState is not enabled, do nothing

  */
  /*
  const updateQueryParameter = (key, value) => {
    if (useUrlState) {
      const urlState = getUrlState();

      if (value === null || value === "") {
        // when value is null or empty, remove key from URL state
        delete urlState[key];
      } else {
        urlState[key] = value;
      }
      const queryString = qs.stringify(urlState);
      push({
        search: `?${queryString}`,
      });
      /*
      history.push({
        search: `?${queryString}`,
      });
      */ /*
    }
  };
*/
  /*

  Note: when state is asc, toggling goes to desc;
  but when state is desc toggling again removes sort.

  */
  const toggleSort = (column) => {
    let currentSort;
    let urlValue;
    if (!state.currentSort[column]) {
      currentSort = { [column]: ascSortOperator };
      urlValue = `${column}|${ascSortOperator}`;
    } else if (state.currentSort[column] === ascSortOperator) {
      currentSort = { [column]: descSortOperator };
      urlValue = `${column}|${descSortOperator}`;
    } else {
      currentSort = {};
      urlValue = null;
    }
    setState((currentState) => ({ ...currentState, currentSort }));
    // updateQueryParameter("sort", urlValue);
  };

  const submitFilters = ({ name, filters }) => {
    // clone state filters object
    let newFilters = Object.assign({}, state.currentFilters);
    if (_isEmpty(filters)) {
      // if there are no filter options, remove column filter from state altogether
      delete newFilters[name];
    } else {
      // else, update filters
      newFilters[name] = filters;
    }
    setState((currentState) => ({
      ...currentState,
      currentFilters: newFilters,
    }));
    // updateQueryParameter("filter", _isEmpty(newFilters) ? null : newFilters);
  };

  const updateSearch = (e) => {
    e.persist();
    e.preventDefault();
    const searchValue = e.target.value;
    setState({
      searchValue,
    });
    delay(() => {
      setState((currentState) => ({
        ...currentState,
        search: searchValue,
      }));
      // updateQueryParameter("search", searchValue);
    }, 700);
  };

  const toggleItem = (id) => {
    const { selectedItems } = state;
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter((x) => x !== id)
      : [...selectedItems, id];
    setState({
      selectedItems: newSelectedItems,
    });
  };

  const Components = useVulcanComponents();

  const { modalProps, data, currentUser, onSubmitSelected, model, options } =
    props;

  // Skip query when data are already provided via props
  const multiRes = useMulti({
    ...options,
    model,
    queryOptions: { skip: !!data },
  });
  if (data) {
    // static JSON datatable
    return (
      <Components.DatatableContents
        {...props}
        datatableData={data}
        totalCount={data.length}
        results={data}
        showEdit={false}
        showDelete={false}
        showNew={false}
        modalProps={modalProps}
      />
    );
  }
  // dynamic datatable with data loading
  /*
      const options = {
        collection
        ...options,
      };

      const DatatableWithMulti = compose(withMulti(options))(
        Components.DatatableContents
      );*/

  let canCreate = false;
  // new APIs
  const check = model.permissions.canCreate;

  // openCRUD backwards compatibility
  //const check = model.graphql.mutations.create.check;
  //_get(collection, "options.mutations.new.check") ||
  //_get(collection, "options.mutations.create.check");

  if (isAdmin(currentUser)) {
    canCreate = true;
  } else if (check) {
    canCreate = permissionCheck({
      check,
      user: currentUser,
      //context: { Users },
      operationName: "create",
    });
  } /* legacy 
    else if (check) {
      canCreate = check && check(currentUser, {}, { Users });
    }*/

  const input: { search?: string; sort?: any; filter?: any } = {};
  if (!_isEmpty(state.search)) {
    input.search = state.search;
  }
  if (!_isEmpty(state.currentSort)) {
    input.sort = state.currentSort;
  }
  if (!_isEmpty(state.currentFilters)) {
    input.filter = state.currentFilters;
  }

  return (
    <Components.DatatableLayout
      model={model}
      //collectionName={collection.options.collectionName}
    >
      <Components.DatatableAbove
        {...props}
        model={model}
        canInsert={canCreate}
        canCreate={canCreate}
        searchValue={state.searchValue}
        updateSearch={updateSearch}
        selectedItems={state.selectedItems}
        onSubmitSelected={onSubmitSelected}
      />
      <Components.DatatableContents
        {...props}
        //datatableData={multiRes.documents}
        results={multiRes.documents}
        totalCount={multiRes.totalCount}
        count={multiRes.count}
        model={model}
        // TODO: check where this prop is used
        currentUser={currentUser}
        toggleSort={toggleSort}
        currentSort={state.currentSort}
        submitFilters={submitFilters}
        currentFilters={state.currentFilters}
        selectedItems={state.selectedItems}
        //input={input}
        toggleItem={toggleItem}
      />
    </Components.DatatableLayout>
  );
};

export const DatatableLayout = ({
  model,
  children,
}: {
  model: VulcanModel;
  children: React.ReactNode;
}) => (
  <div className={`datatable datatable-${model.name.toLowerCase()}`}>
    {children}
  </div>
);

/*

DatatableAbove Component

*/
export const DatatableAbove = (props: any) => {
  const Components = useVulcanComponents();

  return (
    <Components.DatatableAboveLayout>
      <Components.DatatableAboveLeft {...props} />
      <Components.DatatableAboveRight {...props} />
    </Components.DatatableAboveLayout>
  );
};

export const DatatableAboveLeft = (props) => {
  const { showSearch, searchValue, updateSearch } = props;
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  return (
    <div className="datatable-above-left">
      {showSearch && (
        <Components.DatatableAboveSearchInput
          className="datatable-search form-control"
          inputProperties={{
            path: "datatableSearchQuery",
            placeholder: `${intl.formatMessage({
              id: "datatable.search",
              defaultMessage: "Search",
            })}…`,
            value: searchValue,
            onChange: updateSearch,
          }}
        />
      )}
    </div>
  );
};

export const DatatableAboveRight = (props) => {
  const {
    currentUser,
    showNew,
    canInsert,
    options,
    newFormOptions,
    newFormProps,
    showSelect,
    selectedItems,
    onSubmitSelected,
    model,
  } = props;
  const Components = useVulcanComponents();
  return (
    <div className="datatable-above-right">
      {showSelect && selectedItems.length > 0 && (
        <div className="datatable-above-item">
          <Components.DatatableSubmitSelected
            selectedItems={selectedItems}
            onSubmitSelected={onSubmitSelected}
          />
        </div>
      )}
      {showNew && canInsert && (
        <div className="datatable-above-item">
          <Components.NewButton
            model={model}
            currentUser={currentUser}
            mutationFragmentName={options && options.fragmentName}
            {...newFormOptions}
            {...newFormProps}
          />
        </div>
      )}
    </div>
  );
};

export const DatatableAboveSearchInput = (props) => {
  const Components = useVulcanComponents();
  return (
    <div className="datatable-above-search-input">
      <Components.FormComponentText {...props} />
    </div>
  );
};

export const DatatableAboveLayout = ({ children }) => (
  <div className="datatable-above">{children}</div>
);
