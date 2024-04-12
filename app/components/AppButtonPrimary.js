import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles from '../config/style';

const ASPECT_RATIO = 0.25;

export default function AppButtonPrimary({
  isDisabled = false,
  children,
  btTitle = 'Button',
  btPress,
  style = {},
  width = responsiveWidth(50),
  height,
  aspect_ratio = ASPECT_RATIO,
  shadowRadius = 4,
  borderRadius = 10,
  shadow01Color = AppStyles.colors.white,
  shadow02Color = AppStyles.colors.btnShadow,
  textSize = responsiveFontSize(2.4),
  gradientColorArray = [
    AppStyles.colors.btnBg01,
    AppStyles.colors.btnBg02,
    AppStyles.colors.btnBg03,
  ],
  gradientBorderWidth = 4,
  gradientBorderColor = AppStyles.colors.btnText,
}) {
  height = height || width * aspect_ratio;

  btPress =
    btPress ||
    (() => {
      console.log('No handler provided...');
    });

  children = children || (
    <Text style={styles.buttonText(textSize)}>{btTitle}</Text>
  );

  return isDisabled ? (
    <View
      style={[styles.button_disabled, {width, height, borderRadius}, style]}>
      {children}
    </View>
  ) : (
    <TouchableOpacity onPress={btPress}>
      <NeomorphFlex
        style={{
          ...styles.neoFlex,
          ...style,
          width,
          height,
          shadowRadius,
          borderRadius,
          backgroundColor: shadow01Color,
        }}>
        <NeomorphFlex
          style={{
            ...styles.neoFlex2,
            width,
            height,
            shadowRadius,
            borderRadius,
            backgroundColor: shadow02Color,
          }}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={gradientColorArray}
            style={{
              ...styles.linearGradient,
              borderRadius,
              borderWidth: gradientBorderWidth,
              borderColor: gradientBorderColor,
            }}>
            {children}
          </LinearGradient>
        </NeomorphFlex>
      </NeomorphFlex>
    </TouchableOpacity>
  );
}

var styles = StyleSheet.create({
  neoFlex: {
    backgroundColor: AppStyles.colors.white,
  },
  neoFlex2: {
    backgroundColor: AppStyles.colors.btnShadow,
  },
  linearGradient: {
    flex: 1,
    borderWidth: 4,
    borderColor: AppStyles.colors.btnText,
    ...AppStyles.centerXY,
  },
  buttonText: (fontSize) => ({
    fontSize,
    textAlign: 'center',
    color: AppStyles.colors.btnText,
    backgroundColor: 'transparent',
  }),
  button_disabled: {
    ...AppStyles.centerXY,
    backgroundColor: '#A3AAAD',
  },
});
