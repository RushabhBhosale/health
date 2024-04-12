import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ImageinputList from "../ImageinputList";
import ErrorMessage from "./ErrorMessage";

import { useFormikContext } from "formik";

export default function AppFormImagePicker({ name }) {
  const { setFieldValue, values, errors, touched } = useFormikContext();
  const imageUris = values[name];

  const handleAdd = (uri) => {
    setFieldValue(name, [...imageUris, uri]);
  };

  const handleRemove = (uri) => {
    setFieldValue(
      name,
      imageUris.filter((imageUri) => imageUri !== uri)
    );
  };

  return (
    <>
      <ImageinputList
        imageUris={imageUris}
        onAddImage={handleAdd}
        onRemoveImage={handleRemove}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

const styles = StyleSheet.create({});
