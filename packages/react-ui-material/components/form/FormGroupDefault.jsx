import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "meteor/vulcan:core";
import { withStyles } from "../../lib/makeStyles";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/KeyboardArrowDown";
import classNames from "classnames";

const styles = (theme) => ({
  layoutRoot: {
    minWidth: "320px",
  },

  headerRoot: {},

  paper: {
    padding: theme.spacing(3),
  },

  subtitle1: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(0.5),
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },

  collapsible: {
    cursor: "pointer",
  },

  label: {},

  toggle: {
    "& svg": {
      width: 21,
      height: 21,
      display: "block",
    },
  },

  root: {
    paddingLeft: 4,
    paddingRight: 4,
    marginLeft: -4,
    marginRight: -4,
  },

  entered: {
    overflow: "visible",
  },

  hidden: {
    display: "none",
  },
});

const FormGroupHeader = ({
  toggle,
  collapsed,
  hidden,
  label,
  group,
  classes,
}) => {
  const collapsible =
    (group && group.collapsible) || (group && group.name === "admin");

  return (
    <div
      className={classNames(
        classes.headerRoot,
        collapsible && classes.collapsible,
        hidden && classes.hidden,
        "form-group-header"
      )}
      onClick={collapsible ? toggle : null}
    >
      <Typography
        className={classNames(
          "form-group-header-title",
          classes.subtitle1,
          collapsible && classes.collapsible
        )}
        variant="subtitle1"
      >
        <div className={classes.label}>{label}</div>

        {collapsible && (
          <div className={classes.toggle}>
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </div>
        )}
      </Typography>
    </div>
  );
};

FormGroupHeader.propTypes = {
  toggle: PropTypes.func,
  collapsed: PropTypes.bool,
  hidden: PropTypes.bool,
  label: PropTypes.string.isRequired,
  group: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

registerComponent("FormGroupHeader", FormGroupHeader, [withStyles, styles]);

const FormGroupLayout = ({
  label,
  anchorName,
  collapsed,
  hidden,
  hasErrors,
  heading,
  group,
  children,
  classes,
}) => {
  const collapsedIn = (!collapsed && !hidden) || hasErrors;

  return (
    <div
      className={classNames(
        classes.layoutRoot,
        "form-section",
        `form-section-${anchorName}`
      )}
    >
      <a name={anchorName} />

      {heading}

      <Collapse
        classes={{ root: classes.root, entered: classes.entered }}
        in={collapsedIn}
      >
        <Paper className={classes.paper}>{children}</Paper>
      </Collapse>
    </div>
  );
};

FormGroupLayout.propTypes = {
  label: PropTypes.string.isRequired,
  anchorName: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  hidden: PropTypes.bool.isRequired,
  hasErrors: PropTypes.bool.isRequired,
  heading: PropTypes.node,
  group: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
};

registerComponent("FormGroupLayout", FormGroupLayout, [withStyles, styles]);
