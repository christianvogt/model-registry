import React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextArea,
} from '@patternfly/react-core';
import { FormTextAreaProps } from '../componentTypes';

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  isRequired,
  helperText,
  ...props
}) => (
  <FormGroup fieldId={props.id} label={label} isRequired={isRequired}>
    <TextArea {...props} />
    {helperText ? (
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{helperText}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    ) : null}
  </FormGroup>
);
