import { withStyles } from "../../../lib/makeStyles";
import React, { useState } from "react";
//import PropTypes from "prop-types";
import FormControlLayout from "./FormControlLayout";
import FormHelper from "./FormHelper";
import Select from "@mui/material/Select";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import ListSubheader from "@mui/material/ListSubheader";
import StartAdornment, { hideStartAdornment } from "./StartAdornment";
import EndAdornment from "./EndAdornment";
import _isArray from "lodash/isArray";
import classNames from "classnames";
import { styles } from "./FormSuggest";
import { useComponentMixin } from "./mixins/useComponentMixin";

/*
  propTypes: {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    classes: PropTypes.object.isRequired,
    showMenuIndicator: PropTypes.bool,
  },
  */
const FormSelect = (props: any) => {
  // TODO: be careful with the typings: they should be the same as the
  // vulcan component it replaces
  const {
    getFormControlProperties,
    getFormHelperProperties,
    getId,
    cleanProps,
  } = useComponentMixin(props);
  const {
    showMenuIndicator = true,
    disabled,
    layout,
    multiple,
    native,
  } = props;
  /*const getDefaultProps = function () {
    return {
      showMenuIndicator: true,
    };
  },
  getInitialState: function () {
    return {
      isOpen: false,
    };
  },*/
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleChange = function (event) {
    const target = event.target;
    let value;
    const { multiple, native } = props;
    if (multiple && native) {
      value = [];
      for (let i = 0; i < target.length; i++) {
        const option = target.options[i];
        if (option.selected) {
          value.push(option.value);
        }
      }
    } else {
      value = target.value;
    }
    changeValue(value);
  };

  const changeValue = function (value) {
    props.handleChange(value);
  };

  const render = function () {
    if (layout === "elementOnly") {
      return renderElement();
    }

    return (
      <FormControlLayout {...getFormControlProperties()} htmlFor={getId()}>
        {renderElement()}
        <FormHelper {...getFormHelperProperties()} />
      </FormControlLayout>
    );
  };

  const renderElement = function () {
    const renderOption = (item, key) => {
      //eslint-disable-next-line no-unused-vars
      const { group, label, ...rest } = item;
      return native ? (
        <option key={key} {...rest}>
          {label}
        </option>
      ) : (
        <MenuItem key={key} {...rest} className={classes.selectItem}>
          {label}
        </MenuItem>
      );
    };

    const renderGroup = (label, key, nodes) => {
      return native ? (
        <optgroup label={label} key={key}>
          {nodes}
        </optgroup>
      ) : (
        <MenuList
          subheader={<ListSubheader component="div">{label}</ListSubheader>}
          key={key}
        >
          {nodes}
        </MenuList>
      );
    };

    const { options = [], classes } = props;

    let groups = options
      .filter(function (item) {
        return item.group;
      })
      .map(function (item) {
        return item.group;
      });
    // Get the unique items in group.
    groups = [...new Set(groups)];

    let optionNodes: Array<React.ReactNode> = [];

    if (groups.length === 0) {
      optionNodes = options.map(function (item, index) {
        return renderOption(item, index);
      });
    } else {
      // For items without groups.
      const itemsWithoutGroup = options.filter(function (item) {
        return !item.group;
      });

      itemsWithoutGroup.forEach(function (item, index) {
        optionNodes.push(renderOption(item, "no-group-" + index));
      });

      groups.forEach(function (group, groupIndex) {
        const groupItems = options.filter(function (item) {
          return item.group === group;
        });

        const groupOptionNodes = groupItems.map(function (item, index) {
          return renderOption(item, groupIndex + "-" + index);
        });

        optionNodes.push(renderGroup(group, groupIndex, groupOptionNodes));
      });
    }

    let value = props.value;
    if (!multiple && _isArray(value)) {
      value = value.length ? value[0] : "";
    }

    const startAdornment = hideStartAdornment(props) ? null : (
      <StartAdornment
        {...props}
        value={value}
        classes={null}
        changeValue={changeValue}
      />
    );
    const endAdornment = (
      <EndAdornment
        {...props}
        value={value}
        classes={{ inputAdornment: classes.inputAdornment }}
        changeValue={changeValue}
      />
    );

    return (
      <Select
        className="select"
        // TODO: update ref
        //ref={(c) => (this.element = c)}
        {...cleanProps(props)}
        value={value}
        onChange={handleChange}
        onOpen={handleOpen}
        onClose={handleClose}
        disabled={disabled}
        input={
          <Input
            id={getId()}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            classes={{
              root: classes.inputRoot,
              focused: classes.inputFocused,
              input: classNames(
                classes.input,
                !value && classes.inputPlaceholder
              ),
            }}
          />
        }
        classes={{ icon: classes.selectIcon }}
      >
        {optionNodes}
      </Select>
    );
  };
  return render();
};

export default withStyles(styles)(FormSelect);
