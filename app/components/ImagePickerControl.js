import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppBoxShadow from '../components/AppBoxShadow';
import AppButtonIcon from '../components/AppButtonIcon';
import AppStyles from '../config/style';

export default function ImagePickerControl({
  contextObj,
  pickedImage,
  imagePicked,
  _width = responsiveWidth(100) * 0.3,
  aspect_ratio = 4 / 5,
}) {
  const onPickerPress = () => {
    // launchCamera({noData: true}, (response) => {
    //   if (response?.uri) {
    //     imagePicked(response);
    //   }
    // });
    launchImageLibrary({noData: true}, (response) => {
      console.log('Image Picker response', response);
      if (response?.uri) {
        contextObj ? imagePicked(response, contextObj) : imagePicked(response);
      }
    });
  };

  return !pickedImage?.uri ? (
    <TouchableOpacity onPress={onPickerPress}>
      <AppBoxShadow
        width={_width}
        aspect_ratio={aspect_ratio}
        borderRadius={15}
        content_style={AppStyles.centerXY}>
        <View style={styles.img_picker_wrapper}>
          <Image
            source={require('../assets/images/icon_plus.png')}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </View>
      </AppBoxShadow>
    </TouchableOpacity>
  ) : (
    <AppBoxShadow
      width={_width}
      aspect_ratio={aspect_ratio}
      borderRadius={15}
      content_style={AppStyles.centerXY}>
      <View style={styles.img_preview_wrap}>
        <AutoHeightImage
          source={{uri: pickedImage?.uri}}
          width={_width}
          style={{maxHeight: '100%', borderRadius: 15}}
        />
        <AppButtonIcon
          width={20}
          style={styles.btn_remove}
          btPress={() => imagePicked({uri: ''}, contextObj)}>
          <Image
            style={{
              width: '40%',
              height: '40%',
              resizeMode: 'contain',
            }}
            source={require('../assets/images/close_icon.png')}
          />
        </AppButtonIcon>
      </View>
    </AppBoxShadow>
  );
}

const styles = StyleSheet.create({
  img_picker_wrapper: {
    width: 32,
    height: 32,
    ...AppStyles.centerXY,
    borderRadius: 30,
  },
  img_preview_wrap: {
    width: '100%',
    height: '100%',
    ...AppStyles.centerXY,
  },
  btn_remove: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});
