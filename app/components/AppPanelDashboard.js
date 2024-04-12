import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import AppButtonBasic from './AppButtonBasic';
import AppStyles from '../config/style';

export default function AppPanelDashboard({
  backgroundColor = '#999999',
  borderRadius = 15,
  borderWidth = 5,
  borderColor = '#00000031',
  image = require('../assets/images/medicines.png'),
  caption = 'Panel Caption',
  title = 'Panel Title',
  para = 'Panel para of text goes here',
  para_color = '#555555',
  action_title,
  action_color = '#999999',
  action_function,
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
      <View style={styles.row}>
        <View style={styles.panel_image_wrap}>
          <AutoHeightImage
            width={responsiveWidth(100) * 0.12}
            source={image}
            style={styles.panel_image}
          />
        </View>

        <View style={styles.panel_wrap}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <AppPara style={styles.panel_caption}>{caption}</AppPara>
            <AppButtonBasic
              btTitle={action_title}
              color={action_color}
              btPress={action_function}
              style={{flex: 0, paddingHorizontal: 8, paddingVertical: 1}}
            />
          </View>
          <AppHeading style={styles.panel_title}>{title}</AppHeading>
          <AppPara style={{...styles.panel_para, color: para_color}}>
            {para}
          </AppPara>
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
  container: (backgroundColor, borderRadius, borderWidth, borderColor) => ({
    padding: responsiveWidth(4.5),
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
  panel_image_wrap: {
    flexBasis: '20%',
    flexDirection: 'row',
    paddingRight: 5,
  },
  panel_image: {
    marginTop: -10,
  },
  panel_wrap: {
    flexBasis: '80%',
  },
  panel_caption: {
    ...getTextStyle('#F5F5F5', 1.65),
    marginBottom: 3,
  },
  panel_title: {
    ...getTextStyle('#FFFFFF', 2.0),
    marginBottom: 3,
    textAlign: 'left',
  },
  panel_para: {
    ...getTextStyle('#888888', 1.65),
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
