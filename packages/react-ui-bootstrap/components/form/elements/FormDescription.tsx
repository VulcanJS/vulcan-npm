// TODO: not actually used, specific to bootstrap
import React from 'react';
import { FormText } from 'react-bootstrap';

export const FormDescription = ({ description }) => {
  return (
    <FormText>
      <div dangerouslySetInnerHTML={{ __html: description }} />
    </FormText>
  );
};

