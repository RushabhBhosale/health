import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppTextInput from "../AppTextInput";
import ErrorMessage from "./ErrorMessage";

import { useFormikContext } from "formik";

export default function AppFormField({ name, width, ...otherProps }) {
  const {
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
    values,
  } = useFormikContext();

  return (
    <>
      <AppTextInput
        onChangeText={(text) => setFieldValue(name, text)}
        values={values[name]}
        onBlur={() => setFieldTouched(name)}
        width={width}
        {...otherProps}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

const styles = StyleSheet.create({});
