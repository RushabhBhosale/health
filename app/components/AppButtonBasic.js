import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AppStyles from '../config/style';

export default function AppButtonBasic({
  children,
  btTitle = 'Button',
  fontSize = responsiveFontSize(1.6),
  backgroundColor = AppStyles.colors.white,
  color = AppStyles.colors.primary,
  borderRadius = 10,
  style = {},
  btPress = () => console.log('Basic Button Pressed...'),
}) {
  children =
    children ||
    (children = children || (
      <Text style={{...styles.buttonText, fontSize, color}}>{btTitle}</Text>
    ));

  return (
    <TouchableOpacity onPress={btPress}>
      <View
        style={{
          ...styles.btn_wrap,
          ...style,
          borderRadius,
          backgroundColor,
        }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

var styles = StyleSheet.create({
  btn_wrap: {
    flex: 1,
    alignSelf: 'flex-start',
    ...AppStyles.centerXY,
  },
  buttonText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
