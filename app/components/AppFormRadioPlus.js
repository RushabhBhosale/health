import React from 'react';
import {useFormikContext} from 'formik';
import AppRadioInputPlus from './AppRadioInputPlus';

export default function AppFormRadioPlus({
  name,
  onValueChange,
  setRadioError,
  ...otherProps
}) {
  const {setFieldValue, values} = useFormikContext();

  let setFormRadio = (value) => {
    setFieldValue(name, !value);
    onValueChange && onValueChange(!value);
    setRadioError && setRadioError('');
  };

  let _props = {
    ...otherProps,
    radioId: values[name],
    setCheckedRadio: setFormRadio,
  };
  return <AppRadioInputPlus {..._props} />;
}
