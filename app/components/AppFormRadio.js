import React from 'react';
import {useFormikContext} from 'formik';
import AppRadioInput from './AppRadioInput';

export default function AppFormRadio({
  name,
  setRadioError,
  onValueChange,
  ...otherProps
}) {
  const {setFieldValue, values} = useFormikContext();

  let setFormRadio = (value) => {
    setFieldValue(name, value);
    setRadioError && setRadioError('');
    if (onValueChange) onValueChange(value);
  };

  let _props = {
    ...otherProps,
    checkedRadio: values[name],
    setCheckedRadio: setFormRadio,
  };
  return <AppRadioInput {..._props} />;
}
