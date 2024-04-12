import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import defaultStyles from "../config/style";

export default function AppText({ children, style, ...otherProps }) {
  return (
    <Text style={[defaultStyles.text, style]} {...otherProps}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({});
