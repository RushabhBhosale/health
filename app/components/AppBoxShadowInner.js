import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles, {IsAndroid, Container_Width} from '../config/style';

const ASPECT_RATIO = 2 / 3;

export default function AppBoxShadowInner({
  children,
  width = Container_Width,
  height,
  aspect_ratio = ASPECT_RATIO,
  style = {},
  borderRadius = 15,
  shadowRadius = 3,
  shadowColor = AppStyles.colors.lightgrey,
  content_style = {},
}) {
  children = children || (
    <Text>Content of the Box with Inner Shadow goes in here...</Text>
  );

  return (
    <NeomorphFlex
      inner={IsAndroid}
      style={{
        width,
        height: height || width * aspect_ratio,
        borderRadius,
        shadowRadius,
        backgroundColor: shadowColor,
        ...style,
      }}>
      <View
        style={{
          ...styles.wrapper,
          ...content_style,
          borderRadius,
        }}>
        {children}
      </View>
    </NeomorphFlex>
  );
}

var styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
