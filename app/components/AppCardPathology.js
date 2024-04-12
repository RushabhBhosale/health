import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import moment from 'moment';
import AppBoxShadow from './AppBoxShadow';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import {ThumbPlaceholder} from './AppCommonComponents';
import AppStyles, {GetTextStyle} from '../config/style';

export default function AppCardPathology({
  item,
  cardPressed = () => console.log('Card Pressed...'),
  ...remainingBoxProps
}) {
  let c_name = item.pathology?.length && item.pathology?.value?.length && item.pathology[0].value[0].name !== undefined ? 'Thyrocare Laboratories' : 'Simira Lab';

  let c_test_names =
    item.pathology?.length &&
    item.pathology[0].value?.map((tst) => tst.name !== undefined ? tst.name : tst.testName).join(', ') || '';
  let c_consult_icon =
    item.consultTypeName === 'CC'
      ? require('../assets/images/icon_pathology.png')
      : require('../assets/images/no_image.png'); 

  let c_status_image = require('../assets/images/no_image.png');
  let c_status_txt = AppStyles.colors.darkgrey;
  switch (item.appointmentStatus) {
    case 'Completed':
      c_status_txt = '#64AA0C';
      c_status_image = require('../assets/images/tick_green.png');
      break;
    case 'Missed':
    case 'Cancelled':
    case 'Cancel Requested':
      c_status_txt = '#9F0606';
      c_status_image = require('../assets/images/tick_red_arrow.png');
      break;
    case 'Rescheduled':
    case 'Reschedule Requested':
      c_status_txt = '#BC8001';
      c_status_image = require('../assets/images/calendar_red.png');
      break;
    default:
      c_status_txt = '#2167C5';
      c_status_image = require('../assets/images/tick_blue.png');
  }

  return (
    <AppBoxShadow {...remainingBoxProps}>
      <TouchableWithoutFeedback onPress={() => cardPressed(item)}>
        <View style={styles.container}>
          <AutoHeightImage
            width={responsiveWidth(100) * 0.05}
            source={c_consult_icon}
            style={styles.img_consult}
          />
          <View style={styles.row_01}>
            <View style={styles.card_image_wrap}>
              <ThumbPlaceholder
                fName="T"
                lName="C"
                theme={1}
                style={{marginTop: 0}}
              />
            </View>
            <View style={styles.info_wrap}>
              <AppHeading style={styles.info_title}>{c_name}</AppHeading>
              <AppPara style={styles.info_text} numberOfLines={1}>
                {c_test_names}
              </AppPara>
              <AppPara style={styles.info_text_2}>
                {moment.utc(item.appointmentDate).format('ddd, D MMM')}
                {', '}
                {item.appointmentTime}
              </AppPara>
            </View>
          </View>

          <View style={styles.row_02}>
            <View style={styles.c_status_row}>
              <AppBoxShadow
                width={responsiveWidth(100) * 0.06}
                height={responsiveWidth(100) * 0.06}
                borderRadius={25}
                style={{marginRight: 5}}
                content_style={AppStyles.centerXY}>
                <Image style={styles.c_status_icon} source={c_status_image} />
              </AppBoxShadow>
              <Text style={GetTextStyle(c_status_txt, 1.6)}>
                {'  '}
                {item.appointmentStatus}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </AppBoxShadow>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: 'relative',
  },
  img_consult: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  row_01: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  card_image_wrap: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 5,
  },
  info_wrap: {
    flex: 3,
  },
  info_title: {
    ...GetTextStyle('#333333', 2, 'bold'),
    textAlign: 'left',
    marginBottom: 2,
  },
  info_text: {
    ...GetTextStyle('#ababab', 1.7),
    marginBottom: 2,
  },
  info_text_2: {
    ...GetTextStyle('#888888', 1.7, 'bold'),
  },
  row_02: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  c_status_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  c_status_icon: {
    width: responsiveWidth(100) * 0.03,
    height: responsiveWidth(100) * 0.03,
    resizeMode: 'contain',
  },
});
