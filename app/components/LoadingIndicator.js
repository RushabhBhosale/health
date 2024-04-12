import React from "react";

import LottieView from "lottie-react-native";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import colors from "../config/colors";

export default function LoadingIndicator({ visible = false }) {
  if (!visible) return null;
  return (
    <View style={[styles.overlay, styles.horizontal]}>
      <ActivityIndicator size="large" color="#0D6BC8" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    height: "120%",
    width: "100%",
    //backgroundColor: colors.white,
    zIndex: 1,
    opacity: 0.8,
    position: "absolute",
    top: 0,
    left: 0
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
