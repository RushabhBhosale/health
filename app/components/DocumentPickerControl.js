import React, {useState} from 'react';
import {StyleSheet, Text, View, Button, Platform} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import DocumentPicker from 'react-native-document-picker';
import AppButtonPrimary from './AppButtonPrimary';
import AppButtonSecondary from './AppButtonSecondary';
import AppStyles, {IsAndroid} from '../config/style';

export default function DocumentPickerControl({
  contextObj,
  docPicked,
  docType = 'allFiles',
  pickerControl,
  btnType = 'secondary',
  btnTitle = 'SELECT DOCUMENT',
  ...buttonProps
}) {
  const onPickerPress = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types[docType]],
      });
      if (response?.uri) {
        contextObj ? docPicked(response, contextObj) : docPicked(response);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Picker is cancelled by the user.');
      } else {
        console.log('Picker encountered an error.');
      }
    }
  };

  return !pickerControl ? (
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
    <pickerControl btPress={onPickerPress} />
  );
}

const styles = StyleSheet.create({});
