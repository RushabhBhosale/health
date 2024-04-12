import React from 'react';
import {StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles from '../config/style';

const ASPECT_RATIO = 1;

export default function AppButtonBack({
  style = {},
  width = 35,
  height,
  aspect_ratio = ASPECT_RATIO,
  borderRadius = 7,
  shadowRadius = 3,
  shadow01Color = AppStyles.colors.white,
  shadow02Color = AppStyles.colors.btnShadow,
  backgroundColor = AppStyles.colors.lightgrey,
  btPress,
}) {
  height = height || width * aspect_ratio;

  return (
    <NeomorphFlex
      // lightShadowColor={AppStyles.colors.white}
      // darkShadowColor={AppStyles.colors.btnShadow}
      style={{
        width,
        height,
        borderRadius,
        shadowRadius,
        backgroundColor: shadow01Color,
        shadowOffset: {width: 2, height: 2},
        ...style,
      }}>
      <NeomorphFlex
        style={{
          width,
          height,
          borderRadius,
          shadowRadius,
          backgroundColor: shadow02Color,
          shadowOffset: {width: 2, height: 2},
        }}>
        <TouchableOpacity
          style={{...styles.touchOpacity, borderRadius, backgroundColor}}
          onPress={btPress}>
          <Image
            style={{
              width: 15,
              resizeMode: 'contain',
            }}
            source={require('../assets/images/icon_arrow_prev.png')}
          />
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
  buttonIcon: {
    fontSize: responsiveFontSize(2.8),
    color: AppStyles.colors.blue,
  },
});
