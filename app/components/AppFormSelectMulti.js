import React from 'react';
import {useFormikContext} from 'formik';
import AppSelectInputMulti from './AppSelectInputMulti';

export default function AppFormSelectMulti({
  name,
  onValueChange,
  ...otherProps
}) {
  const {
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
    values,
    isSubmitting,
  } = useFormikContext();

  const {optionKey} = otherProps;

  /* console.log('AppFormSelectMulti : name', name);
  console.log('AppFormSelectMulti : value', values[name]);
  console.log('AppFormSelectMulti : errors', errors[name]);
  console.log('AppFormSelectMulti : touched', touched[name]); */

  const optionSelectedFn = (option) => {
    const _list = [...values[name]];
    const _index = _list.indexOf(option[optionKey]);
    _index === -1 ? _list.push(option[optionKey]) : _list.splice(_index, 1);
    setFieldValue(name, _list);
    if (onValueChange) onValueChange(option);
  };

  return (
    <AppSelectInputMulti
      set_selectedOptions={optionSelectedFn}
      selectedOptions={values[name]}
      onBlur={() => setFieldTouched(name)}
      showMsg={isSubmitting || touched[name]}
      error={errors[name]}
      {...otherProps}
    />
  );
}
