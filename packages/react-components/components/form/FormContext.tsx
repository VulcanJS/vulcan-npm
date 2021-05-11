import React, { useContext } from "react";

interface FormContextValue {
  addToDeletedValues: Function;
  addToFailureForm: Function;
  addToSubmitForm: Function;
  addToSuccessForm: Function;
  clearForm: Function;
  clearFormCallbacks: Function;
  currentValues: object;
  deletedValues: Array<any>;
  errors: Array<any>;
  getDocument: Function;
  getLabel: Function;
  initialDocument: object;
  isChanged: Function;
  refetchForm: Function;
  setFormState: Function;
  submitForm: Function;
  throwError: Function;
  updateCurrentValues: Function;
}

export const FormContext =
  React.createContext<FormContextValue | undefined>(undefined);

export const useFormContext = () => {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error(
      "A component is trying to access form context but it is undefined. Please wrap your component with a <Form>."
    );
  return formContext;
};
