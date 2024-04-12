import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppStyles, {GetTextStyle} from '../config/style';

export const DividerX = ({style}) => {
  return <View style={[styles.divider_x, style]}></View>;
};

export const ThumbPlaceholder = ({
  fName,
  lName,
  nameInitials,
  style,
  borderRadius,
  flexBasis,
  font_style,
  fontSize,
  theme,
}) => {
  nameInitials = nameInitials || makeThumbText();

  let thumb_style = styles.thumb_default,
    text_style = styles.text_default;

  if (theme) {
    switch (theme) {
      case 1:
        thumb_style = styles.thumb_theme_1;
        text_style = styles.text_theme_1;
        break;
      case 2:
        thumb_style = styles.thumb_theme_2;
        text_style = styles.text_theme_2;
        break;
      default:
        console.log('default block in thumb placeholder themes');
    }
  }

  function makeThumbText() {
    let initials = '?';
    if (fName && lName) {
      initials = fName.substring(0, 1) + lName.substring(0, 1);
    } else if (fName) {
      initials = fName.substring(0, 1);
    } else if (lName) {
      initials = lName.substring(0, 1);
    }
    return initials;
  }

  return (
    <View style={[thumb_style(borderRadius, flexBasis), style]}>
      <Text style={[text_style(fontSize), font_style]}>{nameInitials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  divider_x: {
    backgroundColor: '#D2D9E5',
    width: '100%',
    height: 1,
  },
  thumb_default: (borderRadius = 18, flexBasis = '90%') => ({
    flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor: '#888888',
    borderRadius,
    ...AppStyles.centerXY,
  }),
  thumb_theme_2: (borderRadius = 18, flexBasis = '90%') => ({
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#888888',
    borderRadius,
    ...AppStyles.centerXY,
  }),
  thumb_theme_1: (borderRadius = 20, flexBasis = '90%') => ({
    flexBasis,
    aspectRatio: 1 / 1,
    borderRadius,
    backgroundColor: '#888888',
    ...AppStyles.centerXY,
    marginTop: 5,
  }),
  text_default: (fontSize = 4) => ({
    ...GetTextStyle('#FFFFFF', fontSize, 'bold', 'center'),
  }),
  text_theme_1: (fontSize = 3) => ({
    ...GetTextStyle('#FFFFFF', fontSize, 'bold', 'center'),
  }),
  text_theme_2: (fontSize = 3) => ({
    ...GetTextStyle('#FFFFFF', fontSize, 'bold', 'center'),
  }),
});
