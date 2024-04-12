import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles, {Container_Width} from '../config/style';

const ASPECT_RATIO = 2 / 3;

export default function AppBoxShadow({
  children,
  width = Container_Width,
  height,
  aspect_ratio = ASPECT_RATIO,
  style = {},
  borderRadius = 15,
  shadowRadius = 3,
  shadow01Color = AppStyles.colors.white,
  shadow02Color = AppStyles.colors.btnShadow,
  backgroundColor = AppStyles.colors.lightgrey,
  content_style = {},
}) {
  children = children || <Text>Content of the Shadow Box goes in here...</Text>;

  return (
    <NeomorphFlex
      // lightShadowColor={AppStyles.colors.white}
      // darkShadowColor={AppStyles.colors.btnShadow}
      style={{
        width,
        height: height || width * aspect_ratio,
        borderRadius,
        shadowRadius,
        backgroundColor: shadow01Color,
        shadowOffset: {width: 2, height: 2},
        ...style,
      }}>
      <NeomorphFlex
        style={{
          width,
          height: height || width * aspect_ratio,
          borderRadius,
          shadowRadius,
          backgroundColor: shadow02Color,
          shadowOffset: {width: 2, height: 2},
        }}>
        <View
          style={{
            ...styles.wrapper,
            ...content_style,
            borderRadius,
            backgroundColor,
          }}>
          {children}
        </View>
      </NeomorphFlex>
    </NeomorphFlex>
  );
}

var styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
