import React from 'react';
import { ActionList, ActionListItem, ActionListGroup } from '@patternfly/react-core';
import { PageSection, Button, Stack, StackItem } from 'kubeflow-ui';
import RegisterModelErrors from './RegisterModelErrors';

type RegistrationFormFooterProps = {
  submitLabel: string;
  submitError?: Error;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  errorName?: string;
  versionName?: string;
  modelName?: string;
};

const RegistrationFormFooter: React.FC<RegistrationFormFooterProps> = ({
  submitLabel,
  submitError,
  isSubmitDisabled,
  isSubmitting,
  onSubmit,
  onCancel,
  errorName,
  versionName,
  modelName,
}) => (
  <PageSection hasBodyWrapper={false} stickyOnBreakpoint={{ default: 'bottom' }}>
    <Stack hasGutter>
      {submitError && (
        <RegisterModelErrors
          submitLabel={submitLabel}
          submitError={submitError}
          errorName={errorName}
          versionName={versionName}
          modelName={modelName}
        />
        // <StackItem>
        //   <Alert
        //     // isInline
        //     variant="danger"
        //     title={submitError.name}
        //     // actionClose={<AlertActionCloseButton onClose={() => setSubmitError(undefined)} />}
        //     onClose={() => setSubmitError(undefined)}
        //   >
        //     {submitError.message}
        //   </Alert>
        // </StackItem>
      )}
      <StackItem>
        <ActionList>
          <ActionListGroup>
            <ActionListItem>
              <Button
                isDisabled={isSubmitDisabled}
                variant="primary"
                id="create-button"
                data-testid="create-button"
                isLoading={isSubmitting}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            </ActionListItem>
            <ActionListItem>
              <Button
                isDisabled={isSubmitting}
                variant="link"
                id="cancel-button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      </StackItem>
    </Stack>
  </PageSection>
);

export default RegistrationFormFooter;
