import { deprecate } from "@vulcanjs/utils";
import React, { Component, useContext } from "react";
import { getString } from "../../intl"; // previously was in meteor/vulcan:lib
// TODO: do we still need the shape?
import { intlShape } from "./shape";
import { Message } from "./typings";

type Formatter<T = any> = (val: T, ...args: any) => string;

interface IntlProps {
  locale: string;
}

const makeFormatMessage =
  ({ locale }: IntlProps) =>
  ({ id, defaultMessage }, values = null) => {
    return getString({ id, defaultMessage, values, /* messages,*/ locale });
  };

const formatAny = (something: any): string => {
  return "" + something;
};

export interface IntlProviderContextValue {
  formatDate: Formatter;
  formatTime: Formatter;
  formatRelative: Formatter;
  formatNumber: Formatter;
  formatPlural: Formatter;
  formatMessage: Formatter<Message>;
  formatHTMLMessage: Formatter;
  now: any;
  locale: string;
}

const makeDefaultValue = ({ locale }: IntlProps): IntlProviderContextValue => ({
  formatDate: formatAny,
  formatTime: formatAny,
  formatRelative: formatAny,
  formatNumber: formatAny,
  formatPlural: formatAny,
  formatMessage: makeFormatMessage({ locale: locale }),
  formatHTMLMessage: formatAny,
  now: null, // ?
  locale: locale,
});

export const IntlProviderContext =
  React.createContext<IntlProviderContextValue>(
    makeDefaultValue({ locale: "" })
  );

export interface IntlProviderProps extends IntlProps {
  children: React.ReactNode;
  // messages: any;
}
export const IntlProvider = ({ locale, ...props }: IntlProviderProps) => {
  return (
    <IntlProviderContext.Provider
      value={makeDefaultValue({ locale })}
      {...props}
    />
  );
};

export const useIntlContext = () => useContext(IntlProviderContext);

/**
 * Use for class components that still rely on the old API
 *
 * This is only necessary when you have a component that rely on multiple contexts
 * and that you cannot move to a stateless component.
 * If you can use a stateless component instead, prefer using useIntlcontext hook
 * If you are stuck with a stateful component, use static contextType = IntlProviderContext
 * If you have multiple context, then you'll need this legacy provider until you can move to hooks
 */
export class LegacyIntlProvider extends Component<IntlProviderProps> {
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
    deprecate(
      "0.0.0",
      "Please React's new context API in your class components: static contextType = IntlProviderContext;, or move to hooks"
    );
    return this.props.children;
  }
}

export default IntlProvider;
