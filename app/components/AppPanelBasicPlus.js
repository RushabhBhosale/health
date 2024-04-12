import React from 'react';
import {StyleSheet, Text, View, TouchableWithoutFeedback} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppStyles from '../config/style';

export default function AppPanelBasicPlus({
  withBorder = false,
  borderWidth = 5,
  borderColor = '#00000031',
  img_section_width = '25%',
  img_width = responsiveWidth(100) * 0.2,
  image = require('../assets/images/phone_held.png'),
  image_pressed = () => console.log('image pressed...'),
  txt_section_width = '70%',
  txt_section = <Text>Panel Text Section...</Text>,
  button_element = false,
  aside_element,
  style = {},
  style_row = {},
}) {
  let panel_border = withBorder
    ? styles.container_border(borderWidth, borderColor)
    : {};

  return (
    <View style={[styles.container, panel_border, style]}>
      <View style={[styles.row, style_row]}>
        <View style={styles.panel_image_wrap(img_section_width)}>
          <TouchableWithoutFeedback onPress={image_pressed}>
            <AutoHeightImage width={img_width} source={image} />
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.panel_wrap(txt_section_width)}>
          {txt_section}
          {button_element && button_element}
        </View>

        {aside_element && aside_element}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFBFC',
    padding: 15,
    borderRadius: 15,
  },
  container_border: (borderWidth, borderColor) => ({
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
  panel_wrap: (width) => ({
    flexBasis: width,
  }),
});
