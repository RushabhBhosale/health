import React from 'react';
import {useFormikContext} from 'formik';
import AppInputDefault from './AppInputDefault';

export default function AppFormInput({name, onValueChange, ...otherProps}) {
  const {
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
    values,
    isSubmitting,
  } = useFormikContext();

  /* console.log('AppFormInput : name', name);
  console.log('AppFormInput : value', values[name]);
  console.log('AppFormInput : errors', errors[name]);
  console.log('AppFormInput : touched', touched[name]); */

  return (
    <AppInputDefault
      onChangeText={(text) => {
        setFieldValue(name, text);
        if (onValueChange) onValueChange(text);
      }}
      value={`${values[name]}`}
      onBlur={() => setFieldTouched(name)}
      isInputValid={Boolean(values[name]) && !errors[name]}
      showMsg={isSubmitting || touched[name]}
      error={errors[name]}
      {...otherProps}
    />
  );
}
