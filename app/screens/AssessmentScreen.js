import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AssessmentScreen({ navigation }) {

  return (
    <View style={styles.container}>
        <Text>Self Assessment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
});
