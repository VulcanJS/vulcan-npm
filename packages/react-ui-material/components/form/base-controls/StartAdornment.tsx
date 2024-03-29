import PropTypes from "prop-types";
import React from "react";
import { instantiateComponent } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { withStyles } from "../../../lib/makeStyles";
import InputAdornment from "@mui/material/InputAdornment";
import WebIcon from "@mui/icons-material/Web";
import EmailIcon from "@mui/icons-material/MailOutline";
import { styles } from "./EndAdornment";

const linkTypes = ["url", "email", "social"];
import TooltipButton from "../../bonus/TooltipButton";

export const hideStartAdornment = (props) => {
  const { type, hideLink } = props;
  return !props.addonBefore && (!linkTypes.includes(type) || hideLink);
};

const StartAdornment = (props, context) => {
  const intl = useIntlContext();

  if (hideStartAdornment(props)) return null;

  const { classes, type, scrubValue, getUrl } = props;
  let value = props.value;
  if (scrubValue) {
    value = scrubValue(value, props);
  }
  const url = getUrl ? getUrl(value, props) : value;
  const socialIcon = type === "social" ? props.addonBefore : undefined;
  const addonBefore = type === "social" ? undefined : props.addonBefore;
  const icon =
    type === "email" ? (
      <EmailIcon />
    ) : socialIcon ? (
      instantiateComponent(socialIcon)
    ) : (
      <WebIcon />
    );

  const urlButton = linkTypes.includes(type) && (
    <TooltipButton
      classes={{ button: classes.urlButton }}
      titleId={`forms.${type}_help`}
      type="icon"
      icon={icon}
      size="small"
      href={url}
      target="_blank"
      disabled={!value}
      aria-label={intl.formatMessage({
        id: `forms.start_adornment_${type}_icon`,
      })}
    />
  );

  return (
    <InputAdornment classes={{ root: classes.inputAdornment }} position="start">
      {instantiateComponent(addonBefore)}
      {urlButton}
    </InputAdornment>
  );
};

StartAdornment.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.any,
  type: PropTypes.string,
  addonBefore: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
};

export default withStyles(styles)(StartAdornment);
