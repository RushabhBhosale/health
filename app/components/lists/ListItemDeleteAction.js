import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../config/colors";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export default function ListItemDeleteAction({ onPress }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.renderRightActions}>
        <MaterialCommunityIcons
          name="trash-can"
          size={35}
          color={colors.white}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  renderRightActions: {
    backgroundColor: colors.danger,
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
