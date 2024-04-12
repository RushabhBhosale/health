import React from 'react';
import {StyleSheet, View, Image, Button} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import AppButtonSecondary from './AppButtonSecondary';
import AppStyles from '../config/style';

export default function AppPanelBasic({
  backgroundColor = '#999999',
  color = '#555555',
  borderRadius = 15,
  withBorder = false,
  borderWidth = 5,
  borderColor = '#00000031',
  image = require('../assets/images/phone_held.png'),
  caption = 'Panel Caption',
  title = 'Panel Title',
  para = 'Panel para of text goes here',
  action_title,
  action_color = '#999999',
  action_function,
  isButton = false,
  button_element,
  style = {},
}) {
  if (isButton && !button_element) {
    button_element = (
      <AppButtonSecondary
        btTitle={action_title}
        titleColor={action_color}
        width={responsiveWidth(22)}
        height={25}
        shadowRadius={2}
        borderRadius={6}
        style={{marginTop: 10}}
        btPress={action_function}
      />
    );
  } else button_element = <></>;

  let panel_border = withBorder
    ? styles.container_border(borderWidth, borderColor)
    : {};

  return (
    <View
      style={[
        styles.container(backgroundColor, borderRadius),
        panel_border,
        style,
      ]}>
      <View style={styles.row}>
        <View style={styles.panel_image_wrap}>
          <Image style={styles.panel_image} source={image} />
        </View>

        <View style={styles.panel_wrap}>
          <AppPara style={styles.panel_caption(color, 1.65)}>{caption}</AppPara>
          <AppHeading style={styles.panel_title(color, 2)}>{title}</AppHeading>
          <AppPara style={styles.panel_para(color, 1.65)}>{para}</AppPara>
          {button_element}
        </View>
      </View>
    </View>
  );
}

const getTextStyle = (color, fontSize) => ({
  fontSize: responsiveFontSize(fontSize),
  color,
});

const styles = StyleSheet.create({
  container: (backgroundColor, borderRadius) => ({
    padding: responsiveWidth(4.5),
    backgroundColor,
    borderRadius,
  }),
  container_border: (borderWidth, borderColor) => ({
    borderWidth,
    borderColor,
  }),
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel_image_wrap: {
    flexBasis: '35%',
    flexDirection: 'row',
    paddingRight: 5,
  },
  panel_image: {
    flexBasis: '100%',
    height: responsiveWidth(25),
    resizeMode: 'contain',
  },
  panel_wrap: {
    flexBasis: '65%',
  },
  panel_caption: (color, fontSize) => ({
    ...getTextStyle(color, fontSize),
    marginBottom: 3,
  }),
  panel_title: (color, fontSize) => ({
    ...getTextStyle(color, fontSize),
    marginBottom: 3,
    textAlign: 'left',
  }),
  panel_para: (color, fontSize) => ({
    ...getTextStyle(color, fontSize),
  }),
});
