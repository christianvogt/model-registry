export type AlertProps = {
  // severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'danger' | 'warning' | 'info' | 'success';
  children?: React.ReactNode;
  onClose?: () => void;
  title: React.ReactNode;

  isInline?: true;
};

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'link';
  // isInline?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  isDisabled?: boolean;
  // icon?: React.ReactNode;
  // iconPosition?: 'start' | 'end';
  isLoading?: boolean;
  href?: string;
  id?: string;
  'aria-label'?: string;
  'data-testid'?: string;
};

export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export type BreadcrumbsProps = {
  children: React.ReactNode;
};

export type BreadcrumbItemProps = {
  children: React.ReactNode;
};

export type FormGroupProps = {
  children: React.ReactNode;
  label: string;
  // labelIcon?: React.ReactNode;
  fieldId: string;
  isRequired?: boolean;
};

export type FormSectionProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export type FormTextInputProps = {
  name: string;
  id: string;
  label: string;
  type?:
    | 'text'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'time'
    | 'url';
  isRequired?: boolean;
  onChange?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  placeholder?: string;
  value?: string;
  isDisabled?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: React.ReactNode;
};

export type FormTextAreaProps = {
  name: string;
  id: string;
  label: string;
  isRequired?: boolean;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>, value: string) => void;
  placeholder?: string;
  value?: string;
  isDisabled?: boolean;
  helperText?: React.ReactNode;
};

export type RadioProps = {
  isChecked: boolean;
  name: string;
  id: string;
  label: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void;
};

export type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  onClear?: () => void;
  style?: React.CSSProperties;
  'data-testid'?: string;
};
