import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";

export default function AppButton({ title, onPress, textColor, fontSize, fontWeight, padding, borderRadius, width="100%", color = "primary" }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors[color], width: width, padding: padding, borderRadius: borderRadius }]}
      onPress={onPress}
    >
      <Text style={[styles.title, {color: colors[textColor], fontSize: fontSize, fontWeight: fontWeight }]}>{title}</Text> 
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    width: "100%",
    marginVertical: 10,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});
