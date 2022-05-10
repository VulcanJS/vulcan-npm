import React from "react";
// TODO: load moment dynamically instead?
import moment from "moment";

// Date
export const CardItemDate = ({ value }) => (
  <span className="contents-date">
    {moment(new Date(value)).format("YYYY/MM/DD, hh:mm")}
  </span>
);
