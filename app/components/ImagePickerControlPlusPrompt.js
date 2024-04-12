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
import simpleAlert from '../utility/alert-boxes';
import AppStyles from '../config/style';

export default function ImagePickerControlPlusPrompt({
  contextObj,
  imagePicked,
  PickerControl,
  pickMethod = 'GALLERY',
  btnType = 'secondary',
  btnTitle = 'ADD IMAGE',
  ...buttonProps
}) {
  const confirmPickMethod = () => {
    simpleAlert({
      title: 'Image Upload',
      content: `Please select the mode of image upload?`,
      okText: 'Camera',
      okCallback: pickByCamera,
      showCancel: true,
      cancelText: 'Gallery',
      cancelCallback: pickByGallery,
    });
  };

  async function pickByCamera() {
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
  }

  function pickByGallery() {
    launchImageLibrary({noData: true}, (response) => {
      if (response?.uri) {
        contextObj ? imagePicked(response, contextObj) : imagePicked(response);
      }
    });
  }

  return !PickerControl ? (
    btnType === 'secondary' ? (
      <AppButtonSecondary
        btTitle={btnTitle}
        width={responsiveWidth(100) * 0.39}
        aspect_ratio={0.22}
        shadowRadius={2}
        borderRadius={4}
        fontSize={responsiveFontSize(1.5)}
        btPress={confirmPickMethod}
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
        btPress={confirmPickMethod}
        {...buttonProps}
      />
    )
  ) : (
    <PickerControl onPress={confirmPickMethod} />
  );
}

const styles = StyleSheet.create({});
