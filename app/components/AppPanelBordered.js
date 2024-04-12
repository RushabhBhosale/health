import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppButtonPrimary from './AppButtonPrimary';
import AppStyles from '../config/style';

export default function AppPanelBordered({
  backgroundColor = '#999999',
  borderRadius = 15,
  borderWidth = 5,
  borderColor = '#00000031',
  pnl_title = <Text>Panel title...</Text>,
  image_wrap_width = '34%',
  pnl_image = require('../assets/images/img_shield.png'),
  pnl_img_width = responsiveWidth(100) * 0.15,
  text_wrap_width = '66%',
  pnl_text = <Text>Panel text here...</Text>,
  button_config,
  style = {},
}) {
  return (
    <View
      style={[
        styles.container(
          backgroundColor,
          borderRadius,
          borderWidth,
          borderColor,
        ),
        style,
      ]}>
      <View style={styles.panel_title}>{pnl_title}</View>
      <View style={styles.row}>
        <View style={styles.panel_image_wrap(image_wrap_width)}>
          <AutoHeightImage
            width={pnl_img_width}
            source={pnl_image}
            style={styles.panel_image}
          />
        </View>
        <View style={styles.panel_text_wrap(text_wrap_width)}>{pnl_text}</View>
      </View>
      <AppButtonPrimary
        btTitle={'BUTTON TITLE'}
        width={responsiveWidth(100) * 0.68}
        aspect_ratio={0.2}
        textSize={responsiveFontSize(2.45)}
        style={{marginTop: 18, marginBottom: 13}}
        {...button_config}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: (backgroundColor, borderRadius, borderWidth, borderColor) => ({
    padding: 20,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
  }),
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel_image_wrap: (width) => ({
    flexBasis: width,
    flexDirection: 'row',
  }),
  panel_image: {},
  panel_text_wrap: (width) => ({
    flexBasis: width,
  }),
});
