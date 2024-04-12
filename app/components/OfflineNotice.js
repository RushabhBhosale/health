import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../config/colors";
import AppText from "./AppText";

// import Constants from "expo-constants";
import {StatusBar} from 'react-native';

import { useNetInfo } from "@react-native-community/netinfo";

export default function OfflineNotice() {
  const netInfo = useNetInfo();

  if (netInfo.type !== "unknown" && !netInfo.isInternetReachable)
    return (
      <View style={styles.container}>
        <AppText style={styles.text}>No Internet Connection</AppText>
      </View>
    );

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    height: 50,
    position: "absolute",
    zIndex: 1,
    width: "100%",
    top: StatusBar.currentHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
  },
});
