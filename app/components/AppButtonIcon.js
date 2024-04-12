import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles from '../config/style';

const ASPECT_RATIO = 1;

export default function AppButtonIcon({
  isDisabled = false,
  isPressed = false,
  children,
  style = {},
  width = 35,
  height,
  aspect_ratio = ASPECT_RATIO,
  shadowRadius = 3,
  borderRadius = 7,
  shadow01Color = AppStyles.colors.white,
  shadow02Color = AppStyles.colors.btnShadow,
  shadow01Offset = {width: 2, height: 2},
  shadow02Offset = {width: 2, height: 2},
  backgroundColor = AppStyles.colors.lightgrey,
  btPress,
}) {
  height = height || width * aspect_ratio;

  children = children || (
    <Image
      style={{
        width: 15,
        resizeMode: 'contain',
      }}
      source={require('../assets/images/icon_arrow_prev.png')}
    />
  );

  return isDisabled ? (
    <View
      style={[styles.button_disabled, {width, height, borderRadius}, style]}>
      {children}
    </View>
  ) : isPressed ? (
    <TouchableOpacity onPress={btPress}>
      <View
        style={[styles.button_pressed, {width, height, borderRadius}, style]}>
        {children}
      </View>
    </TouchableOpacity>
  ) : (
    <NeomorphFlex
      // lightShadowColor={AppStyles.colors.white}
      // darkShadowColor={AppStyles.colors.btnShadow}
      style={{
        width,
        height,
        borderRadius,
        shadowRadius,
        backgroundColor: shadow01Color,
        shadowOffset: shadow01Offset,
        ...style,
      }}>
      <NeomorphFlex
        style={{
          width,
          height,
          borderRadius,
          shadowRadius,
          backgroundColor: shadow02Color,
          shadowOffset: shadow02Offset,
        }}>
        <TouchableOpacity
          style={{...styles.touchOpacity, borderRadius, backgroundColor}}
          onPress={btPress}>
          {children}
        </TouchableOpacity>
      </NeomorphFlex>
    </NeomorphFlex>
  );
}

var styles = StyleSheet.create({
  touchOpacity: {
    flex: 1,
    ...AppStyles.centerXY,
  },
  button_pressed: {
    ...AppStyles.centerXY,
    backgroundColor: '#CEDEFF',
  },
  button_disabled: {
    ...AppStyles.centerXY,
    backgroundColor: '#A3AAAD',
  },
});
