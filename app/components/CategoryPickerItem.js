import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import Icon from "./Icon";

export default function CategoryPickerItem({ item, onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <Icon
          backgroundColor={item.backgroundColor}
          name={item.icon}
          size={80}
        />
        <AppText style={styles.text}>{item.label}</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    width: "33%",
  },
  text: {
    marginTop: 8,
    textAlign: "center",
  },
});
