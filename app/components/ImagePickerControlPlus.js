import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {request, PERMISSIONS} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AppButtonSecondary from './AppButtonSecondary';
import AppButtonPrimary from './AppButtonPrimary';
import AppStyles from '../config/style';

export default function ImagePickerControlPlus({
  contextObj,
  imagePicked,
  PickerControl,
  pickMethod = 'GALLERY',
  btnType = 'secondary',
  btnTitle = 'ADD IMAGE',
  ...buttonProps
}) {
  const onPickerPress = async () => {
    if (pickMethod === 'CAMERA') {
      const camera = await request(
        Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        }),
      );
      if (camera === 'granted') {
        launchCamera({noData: true}, (response) => {
          if (response?.uri) {
            contextObj
              ? imagePicked(response, contextObj)
              : imagePicked(response);
          }
        });
      }
    } else {
      launchImageLibrary({noData: true}, (response) => {
        if (response?.uri) {
          contextObj
            ? imagePicked(response, contextObj)
            : imagePicked(response);
        }
      });
    }
  };

  return !PickerControl ? (
    btnType === 'secondary' ? (
      <AppButtonSecondary
        btTitle={btnTitle}
        width={responsiveWidth(100) * 0.39}
        aspect_ratio={0.22}
        shadowRadius={2}
        borderRadius={4}
        fontSize={responsiveFontSize(1.5)}
        btPress={onPickerPress}
        {...buttonProps}
      />
    ) : (
      <AppButtonPrimary
        btTitle={btnTitle}
        width={responsiveWidth(100) * 0.39}
        aspect_ratio={0.22}
        shadowRadius={2}
        borderRadius={4}
        textSize={responsiveFontSize(1.5)}
        gradientBorderWidth={2}
        btPress={onPickerPress}
        {...buttonProps}
      />
    )
  ) : (
    <PickerControl onPress={onPickerPress} />
  );
}

const styles = StyleSheet.create({});
