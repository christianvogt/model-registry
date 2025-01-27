import React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { FormTextInputProps } from '../componentTypes';

export const FormTextInput: React.FC<FormTextInputProps> = ({
  label,
  isRequired,
  startAdornment,
  endAdornment,
  helperText,
  ...props
}) => (
  <FormGroup fieldId={props.id} label={label} isRequired={isRequired}>
    {startAdornment ? (
      <TextInputGroup>
        <TextInputGroupMain icon={startAdornment} {...props} />
        {endAdornment ? <TextInputGroupUtilities style={{ minWidth: 30 }} /> : null}
      </TextInputGroup>
    ) : (
      <TextInput customIcon={endAdornment} {...props} />
    )}
    {helperText ? (
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{helperText}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    ) : null}
  </FormGroup>
);
