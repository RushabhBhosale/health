import React from 'react';
import {useFormikContext} from 'formik';
import AppSelectInput from './AppSelectInput';

export default function AppFormSelect({name, onValueChange, ...otherProps}) {
  const {
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
    values,
    isSubmitting,
  } = useFormikContext();

  /* console.log('AppFormSelect : name', name);
  console.log('AppFormSelect : value', values[name]);
  console.log('AppFormSelect : errors', errors[name]);
  console.log('AppFormSelect : touched', touched[name]); */

  return (
    <AppSelectInput
      set_selectedOption={(option) => {
        setFieldValue(name, option);
        if (onValueChange) onValueChange(option);
      }}
      selectedOption={values[name]}
      onBlur={() => setFieldTouched(name)}
      showMsg={isSubmitting || touched[name]}
      error={errors[name]}
      {...otherProps}
    />
  );
}
