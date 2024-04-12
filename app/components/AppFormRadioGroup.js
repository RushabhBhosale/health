import React from 'react';
import {View} from 'react-native';
import {useFormikContext} from 'formik';
import AppFormError from './AppFormError';

export default function AppFormRadioGroup({
  children,
  name,
  style = {},
  style_error = {},
}) {
  const {touched, errors, isSubmitting} = useFormikContext();

  const error_style = {position: 'absolute', bottom: 10, ...style_error};

  return (
    <View style={style}>
      {children}
      <AppFormError
        showMsg={isSubmitting || touched[name]}
        error={errors[name]}
        style={error_style}
      />
    </View>
  );
}
