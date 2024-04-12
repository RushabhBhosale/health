import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles, {IsAndroid} from '../config/style';

const ASPECT_RATIO = 1;

export default function AppButtonIconInner({
  children,
  width = 35,
  height,
  aspect_ratio = ASPECT_RATIO,
  borderRadius = 7,
  shadowRadius = 2,
  shadowColor = AppStyles.colors.lightgrey,
  backgroundColor = AppStyles.colors.lightgrey,
  appendPadding = 10,
  style = {},
  inner_style = {},
  btPress,
}) {
  height = height || width * aspect_ratio;

  children = children || (
    <Image
      style={{
        width: 15,
        resizeMode: 'contain',
      }}
      source={require('../assets/images/close_icon_trans.png')}
    />
  );

  return (
    <TouchableOpacity onPress={btPress} style={{borderRadius}}>
      <NeomorphFlex
        inner={IsAndroid}
        style={{
          ...styles.outer_shadow,
          width,
          height,
          borderRadius,
          shadowRadius,
          backgroundColor: shadowColor,
          ...style,
        }}>
        <NeomorphFlex
          style={{
            ...styles.inner_shadow,
            width: width - appendPadding,
            height: height - appendPadding,
            borderRadius,
            shadowRadius,
            backgroundColor: shadowColor,
            ...inner_style,
          }}>
          {children}
        </NeomorphFlex>
      </NeomorphFlex>
    </TouchableOpacity>
  );
}

var styles = StyleSheet.create({
  // touchOpacity: {
  //   flex: 1,
  //   ...AppStyles.centerXY,
  // },
  outer_shadow: {
    padding: 10,
    ...AppStyles.centerXY,
  },
  inner_shadow: {
    borderRadius: 50,
    ...AppStyles.centerXY,
  },
});
