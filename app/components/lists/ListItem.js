import React from "react";
import { Image, StyleSheet, TouchableHighlight, View } from "react-native";
import colors from "../../config/colors";
import AppText from "../AppText";

import Swipeable from "react-native-gesture-handler/Swipeable";

export default function ListItem({
  title,
  subTitle,
  image,
  onPress,
  renderRightActions,
  ImageComponent,
}) {
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableHighlight onPress={onPress} underlayColor={colors.lightgrey}>
        <View style={styles.container}>
          {/* {ImageComponent} */}
          {image && <Image style={styles.image} source={image} />}
          <View style={styles.detailsContainer}>
            <AppText style={styles.title} numberOfLines={1}>
              {title}
            </AppText>
            {subTitle && (
              <AppText style={styles.subTitle} numberOfLines={2}>
                {subTitle}
              </AppText>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
    backgroundColor: colors.white,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  detailsContainer: {
    marginLeft: 10,
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontWeight: "500",
  },
  subTitle: {
    color: colors.mediumgrey,
  },
});
