import React, { Component } from "react";
import { getString } from "../../intl"; // previously was in meteor/vulcan:lib
import { intlShape } from "./shape";

export interface IntlProviderProps {
  locale: string;
  // messages: any;
}
export class IntlProvider extends Component<IntlProviderProps> {
  static childContextTypes = {
    intl: intlShape,
  };
  formatMessage = ({ id, defaultMessage }, values = null) => {
    const { /*messages,*/ locale } = this.props;
    return getString({ id, defaultMessage, values, /* messages,*/ locale });
  };

  formatStuff = (something) => {
    return something;
  };

  getChildContext() {
    return {
      intl: {
        formatDate: this.formatStuff,
        formatTime: this.formatStuff,
        formatRelative: this.formatStuff,
        formatNumber: this.formatStuff,
        formatPlural: this.formatStuff,
        formatMessage: this.formatMessage,
        formatHTMLMessage: this.formatStuff,
        now: this.formatStuff,
        locale: this.props.locale,
      },
    };
  }

  render() {
    return this.props.children;
  }
}

export default IntlProvider;
