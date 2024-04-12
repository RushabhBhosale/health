import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles from '../config/style';

const ASPECT_RATIO = 0.25;

export default function AppButtonSecondary({
  isDisabled = false,
  isPressed = false,
  isToggled = false,
  children,
  style = {},
  btTitle = 'Button',
  width = responsiveWidth(50),
  height,
  aspect_ratio = ASPECT_RATIO,
  shadowRadius = 4,
  borderRadius = 10,
  shadow01Offset = {width: 2, height: 2},
  shadow02Offset = {width: 2, height: 2},
  shadow01Color = AppStyles.colors.white,
  shadow01Clr_tgl = '#0D6BC8',
  shadow02Color = AppStyles.colors.btnShadow,
  shadow02Clr_tgl = '#00458A',
  titleColor = AppStyles.colors.blue,
  titleClr_disabled = AppStyles.colors.blue,
  titleClr_pressed = AppStyles.colors.blue,
  backgroundColor = AppStyles.colors.lightgrey,
  bgColor_disabled = '#A3AAAD',
  bgColor_pressed = '#CEDEFF',
  fontSize = responsiveFontSize(1.6),
  btPress,
}) {
  height = height || width * aspect_ratio;

  const bgColor = !isToggled ? backgroundColor : titleColor;
  let txtColor = !isToggled ? titleColor : backgroundColor;
  txtColor = isDisabled ? titleClr_disabled : txtColor;
  txtColor = isPressed ? titleClr_pressed : txtColor;
  shadow01Color = !isToggled ? shadow01Color : shadow01Clr_tgl;
  shadow02Color = !isToggled ? shadow02Color : shadow02Clr_tgl;

  btPress =
    btPress ||
    (() => {
      console.log('No handler provided...');
    });

  children = children || (
    <Text style={{...styles.buttonText, fontSize, color: txtColor}}>
      {btTitle}
    </Text>
  );

  return isDisabled ? (
    <View
      style={[
        styles.button_disabled(bgColor_disabled),
        {width, height, borderRadius},
        style,
      ]}>
      {children}
    </View>
  ) : isPressed ? (
    <TouchableOpacity onPress={btPress}>
      <View
        style={[
          styles.button_pressed(bgColor_pressed),
          {width, height, borderRadius},
          style,
        ]}>
        {children}
      </View>
    </TouchableOpacity>
  ) : (
    <NeomorphFlex
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
          style={{
            ...styles.touchOpacity,
            borderRadius,
            backgroundColor: bgColor,
          }}
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
  buttonText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  button_pressed: (backgroundColor) => ({
    ...AppStyles.centerXY,
    backgroundColor,
  }),
  button_disabled: (backgroundColor) => ({
    ...AppStyles.centerXY,
    backgroundColor,
  }),
});
