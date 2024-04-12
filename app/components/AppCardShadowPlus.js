import React from 'react';
import {StyleSheet, View, TouchableWithoutFeedback} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppBoxShadow from './AppBoxShadow';
import AppStyles from '../config/style';

export default function AppCardShadowPlus({
  aspect_ratio = 0.21,
  cardPressed = () => console.log('card pressed...'),
  thumb_section_width = '17%',
  c_thumb = require('../assets/images/doc_prescription.png'),
  c_thumb_width = responsiveWidth(100) * 0.075,
  txt_section_width = '83%',
  txt_section = <Text>Card Text Section...</Text>,
  ...restProps
}) {
  return (
    <AppBoxShadow aspect_ratio={aspect_ratio} {...restProps}>
      <TouchableWithoutFeedback onPress={cardPressed}>
        <View style={styles.row}>
          <View style={styles.c_thumb_wrap(thumb_section_width)}>
            <AutoHeightImage width={c_thumb_width} source={c_thumb} />
          </View>

          <View style={styles.c_content_wrap(txt_section_width)}>
            {txt_section}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </AppBoxShadow>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  c_thumb_wrap: (width) => ({
    flexBasis: width,
    flexDirection: 'row',
    paddingRight: 10,
  }),
  c_content_wrap: (width) => ({
    flexBasis: width,
  }),
});
