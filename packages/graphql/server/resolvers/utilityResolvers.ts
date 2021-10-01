import moment from "moment-timezone";

export const formattedDateResolver = (fieldName) => {
  return async (document = {}, args: any = {}, context: any = {}) => {
    const { format } = args;
    const { timezone /*= getSetting("timezone")*/ } = context;
    if (!document[fieldName]) return;
    let m = moment(document[fieldName]);
    if (timezone) {
      m = m.tz(timezone);
    }
    return format === "ago" ? m.fromNow() : m.format(format);
  };
};
