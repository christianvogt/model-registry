import React from 'react';
// import { FormGroup, TextInput } from '@patternfly/react-core';
// import FormFieldset from '~/app/pages/modelRegistry/screens/components/FormFieldset';
// import { isMUITheme } from '~/shared/utilities/const';
import { FormTextInput } from 'kubeflow-ui';

type PrefilledModelRegistryFieldProps = {
  mrName?: string;
};

const PrefilledModelRegistryField: React.FC<PrefilledModelRegistryFieldProps> = ({ mrName }) => (
  <FormTextInput
    isDisabled
    isRequired
    type="text"
    id="mr-name"
    name="mr-name"
    value={mrName}
    label="Model registry"
  />
);

// {
// const mrNameInput = (
//   <TextInput isDisabled isRequired type="text" id="mr-name" name="mr-name" value={mrName} />
// );

// return (
//   <FormGroup className="form-group-disabled" label="Model registry" isRequired fieldId="mr-name">
//     {isMUITheme() ? <FormFieldset component={mrNameInput} field="Model Registry" /> : mrNameInput}
//   </FormGroup>
// );
// };

export default PrefilledModelRegistryField;
