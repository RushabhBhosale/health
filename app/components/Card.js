import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "react-native-expo-image-cache";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import colors from "../config/colors";
import AppText from "./AppText";

export default function Card({
  title,
  price,
  imageUrl,
  onPress,
  thumbnailUrl,
}) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <Image
          tint="light"
          style={styles.imageStyle}
          preview={{ uri: thumbnailUrl }}
          uri={imageUrl}
        />
        <View style={styles.detailsContainer}>
          <AppText style={styles.title} numberOfines={1}>
            {title}
          </AppText>
          <AppText style={styles.price}>{price}</AppText>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: "hidden",
  },
  imageStyle: {
    width: "100%",
    height: 200,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 7,
  },
  price: {
    color: colors.secondary,
    fontWeight: "bold",
  },
});
