import React from "react";
import { StyleSheet, Text, View, Platform, TextInput } from "react-native";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import defaultStyles from "../config/style";

export default function AppTextInput({ icon, width = "100%", ...otherProps }) {
  return (
    <View style={[styles.container, { width }]}>
      {/* {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={defaultStyles.colors.mediumgrey}
          style={styles.icon}
        />
      )} */}
      <TextInput
        style={defaultStyles.text}
        {...otherProps}
        color={defaultStyles.colors.darkgrey}
        placeholderTextColor={defaultStyles.colors.mediumgrey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.lightgrey,
    borderRadius: 25,
    flexDirection: "row",
    padding: 15,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
});
