import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import moment from 'moment';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import AppBoxShadowInner from './AppBoxShadowInner';
import AppBoxShadow from './AppBoxShadow';
import {ThumbPlaceholder} from './AppCommonComponents';
import AppStyles, {GetTextStyle} from '../config/style';
import {getFullUrl} from '../config/functions';

const THUMB_BORDER_RADIUS = 18;

export default function AppointmentDetailSection({data, style_wrap = {}}) {
  const profile_image = getFullUrl(
    data?.doc_avtar,
    'doctors/' + data?.doc_id + '/',
  );
  return (
    <>
      <View style={{flexShrink: 1, marginBottom: 24}}>
        <AppBoxShadowInner
          aspect_ratio={205 / 297}
          content_style={AppStyles.centerXY}>
          <View style={styles.card}>
            <AppBoxShadow
              width={responsiveWidth(100) * 0.21}
              aspect_ratio={1 / 1}
              borderRadius={THUMB_BORDER_RADIUS}
              style={{marginBottom: 10}}>
              {profile_image ? (
                <Image style={styles.cd_thumb} source={{uri: profile_image}} />
              ) : (
                <ThumbPlaceholder
                  fName={data?.doc_fName}
                  lName={data?.doc_lName}
                />
              )}
            </AppBoxShadow>
            <AppHeading style={styles.cd_title}>{data.doc_name}</AppHeading>
            <View style={{flexDirection: 'row', marginBottom: 5}}>
              <AppPara style={styles.cd_sub_text}>{data.doc_specialty}</AppPara>
              <InfoPill text={data.doc_experience} />
              {/* <InfoPill text={data.doc_distance} /> */}
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                justifyContent: 'center',
              }}>
              <Text style={styles.cd_sub_text_2}>
                {data.doc_degree}
                {/* {{docInfo?.degree.length &&
                        docInfo.degree
                          .reduce((acc, itm) => (acc.push(itm.name), acc), [])
                          .join(', ')}} */}
              </Text>
            </View>
          </View>
        </AppBoxShadowInner>
      </View>

      <View style={[{flexShrink: 1, marginBottom: 35}, style_wrap]}>
        <Text
          style={[
            GetTextStyle(undefined, 1.8, 'bold', 'center'),
            {marginBottom: 4},
          ]}>
          Booking Details
        </Text>
        <View style={styles.booking_consult}>
          <AutoHeightImage
            width={22}
            source={data.consult_icon}
            style={{marginRight: 9}}
          />
          <Text
            style={GetTextStyle(
              AppStyles.colors.linkcolor,
              2.45,
              'bold',
              'center',
            )}>
            {data.consultation_type} Consultation
          </Text>
        </View>
        <Text
          style={[
            GetTextStyle(AppStyles.colors.linkcolor, 1.7, 'bold', 'center'),
            {marginBottom: 1},
          ]}>
          {moment.utc(data.date).format('ddd, D MMM YYYY')}, {data.time}
        </Text>
        <Text style={GetTextStyle(undefined, 1.5, undefined, 'center')}>
          {data.consult_happening}
        </Text>
      </View>
    </>
  );
}

const InfoPill = ({text}) => <Text style={styles.info_pill}>{text}</Text>;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '90%',
    ...AppStyles.centerXY,
  },
  cd_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
  },
  cd_title: {
    ...GetTextStyle(undefined, 2.6, 'bold'),
    marginBottom: 5,
  },
  cd_sub_text: {
    ...GetTextStyle(undefined, 2.0),
    fontWeight: 'bold',
    marginRight: 8,
  },
  cd_sub_text_2: {
    ...GetTextStyle(undefined, 1.6, undefined, 'center'),
  },
  info_pill: {
    ...GetTextStyle('#2167C5', 1.5),
    textAlign: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 5,
  },
  booking_consult: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
});
