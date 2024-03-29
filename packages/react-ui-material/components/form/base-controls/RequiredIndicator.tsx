import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "../../../lib/makeStyles";
import classNames from "classnames";

export const styles = (theme) => ({
  root: {
    marginLeft: 4,
  },

  missing: {
    color: theme.palette.error.main,
  },
});

const RequiredIndicator = (props) => {
  const { classes, optional, value } = props;
  const className = classNames(
    "required-indicator",
    "optional-symbol",
    classes.root,
    !value && classes.missing
  );

  return optional ? null : <span className={className}>*</span>;
};

RequiredIndicator.propTypes = {
  classes: PropTypes.object.isRequired,
  optional: PropTypes.bool,
  value: PropTypes.any,
};

export default withStyles(styles)(RequiredIndicator);
