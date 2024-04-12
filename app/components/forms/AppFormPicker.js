import React from "react";
import { StyleSheet } from "react-native";
import ErrorMessage from "./ErrorMessage";

import { useFormikContext } from "formik";
import AppPicker from "../AppPicker";

export default function AppFormPicker({
  items,
  name,
  width,
  placeholder,
  PicketItemComponent,
  numOfColumns = 1,
}) {
  const { setFieldValue, values, errors, touched } = useFormikContext();

  return (
    <>
      <AppPicker
        items={items}
        onSelectItem={(item) => setFieldValue(name, item)}
        selectedItem={values[name]}
        placeholder={placeholder}
        width={width}
        numOfColumns={numOfColumns}
        PicketItemComponent={PicketItemComponent}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

const styles = StyleSheet.create({});
