import React from "react";
import PropTypes from "prop-types";
import { instantiateComponent } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { withStyles } from "../../../lib/makeStyles";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Cancel";
import MenuDownIcon from "@mui/icons-material/ArrowDropDown";
import classNames from "classnames";
import _omit from "lodash/omit.js";

export const styles = (theme) => ({
  inputAdornment: {
    whiteSpace: "nowrap",
    marginTop: "0 !important",
    "& > *": {
      verticalAlign: "bottom",
    },
    "& > svg": {
      color: theme.palette.common.darkBlack,
    },
    "& > * + *": {
      marginLeft: 8,
    },
    height: "auto",
  },

  menuIndicator: {
    padding: 10,
    marginRight: -40,
    marginLeft: -16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.midBlack,
    pointerEvents: "none",
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.short,
    }),
  },

  clearButton: {
    opacity: 0,
    "& svg": {
      width: 20,
      height: 20,
    },
    marginRight: -12,
    marginLeft: -4,
    "&:first-child": {
      marginLeft: -12,
    },
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.short,
    }),
  },

  urlButton: {
    width: 40,
    height: 40,
    fontSize: 20,
    marginLeft: -4,
    marginRight: -4,
  },
});

const EndAdornment = (props) => {
  const {
    classes,
    value,
    addonAfter,
    changeValue,
    showMenuIndicator,
    hideClear,
    disabled,
  } = props;
  const intl = useIntlContext();

  if (!addonAfter && (!changeValue || hideClear || disabled)) return null;
  const hasValue = !!value || value === 0;

  const clearButton = changeValue && !hideClear && !disabled && (
    <IconButton
      className={classNames(
        "clear-button",
        classes.clearButton,
        hasValue && "has-value"
      )}
      onClick={(event) => {
        event.preventDefault();
        changeValue(null);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      tabIndex={-1}
      aria-label={intl.formatMessage({ id: "forms.delete_field" })}
      disabled={!hasValue}
      size="large"
    >
      <CloseIcon />
    </IconButton>
  );

  const menuIndicator = showMenuIndicator && !disabled && (
    <div
      className={classNames(
        "menu-indicator",
        classes.menuIndicator,
        hasValue && "has-value"
      )}
    >
      <MenuDownIcon />
    </div>
  );

  return (
    <InputAdornment classes={{ root: classes.inputAdornment }} position="end">
      {instantiateComponent(addonAfter, _omit(props, ["classes"]))}
      {menuIndicator}
      {clearButton}
    </InputAdornment>
  );
};

EndAdornment.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.any,
  changeValue: PropTypes.func,
  showMenuIndicator: PropTypes.bool,
  hideClear: PropTypes.bool,
  addonAfter: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
};

export default withStyles(styles)(EndAdornment);
