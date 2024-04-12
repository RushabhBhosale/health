import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AppStyles from '../config/style';

export default function AppErrorMessage({
  showMsg,
  error,
  style,
  ...otherProps
}) {
  return !showMsg || !error ? null : (
    <Text style={[AppStyles.text, styles.text, style]} {...otherProps}>
      {error}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: responsiveFontSize(1.8),
    color: AppStyles.colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
});
