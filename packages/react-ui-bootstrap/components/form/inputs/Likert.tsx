import { FormInputProps, useFormContext, useVulcanComponents } from '@vulcanjs/react-ui';
import React from 'react';
import { FormCheck } from "react-bootstrap"

const getRange = (n = 10) => [...Array(n).keys()].map(i => i + 1).map(i => ({ value: i, label: i }));

export const Likert = ({ refFunction, path, label, inputProperties, itemProperties = {} }: FormInputProps) => {
  const { updateCurrentValues } = useFormContext()
  const Components = useVulcanComponents()
  const {
    // @ts-ignore TODO: options shouldn't be there
    options = [], value, ...otherInputProperties } = inputProperties;
  const hasValue = value !== '';
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <div className="likert-scale">
        <div className="likert-row">
          <div />
          {getRange().map((rating, i) => (
            <div key={i} className="likert-row-cell">
              {i + 1}
            </div>
          ))}
        </div>
        {options.map((option, i) => {
          const optionPath = `${path}.${option.value}`;
          const optionValue = value && value[option.value];
          return (
            <div key={i} className="likert-row">
              <div className="likert-row-heading">{option.label}</div>
              {/* <div className="likert-row-contents"> */}
              {getRange().map((rating, i) => {
                const isChecked = optionValue === rating.value;
                const checkClass = hasValue ? (isChecked ? 'form-check-checked' : 'form-check-unchecked') : '';
                return (
                  <div key={i} className="likert-row-cell">
                    {/** @ts-ignore */}
                    <FormCheck
                      {...otherInputProperties}
                      key={i}
                      layout="elementOnly"
                      type="radio"
                      label={rating.label}
                      value={rating.value}
                      name={optionPath}
                      id={optionPath}
                      path={optionPath}
                      ref={refFunction}
                      checked={isChecked}
                      className={checkClass}
                      onChange={() => {
                        updateCurrentValues({ [optionPath]: rating.value });
                      }}
                    />
                  </div>
                );
              })}
              {/* </div> */}
            </div>
          );
        })}
      </div>
    </Components.FormItem>
  );
};

