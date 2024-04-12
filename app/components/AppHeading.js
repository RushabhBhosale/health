import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AppStyles from '../config/style';

export default function AppHeading({children, style, ...otherProps}) {
  return (
    <Text style={[AppStyles.text, styles.text, style]} {...otherProps}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: responsiveFontSize(2.4),
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
