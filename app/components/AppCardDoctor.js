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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AutoHeightImage from 'react-native-auto-height-image';
import AppBoxShadow from './AppBoxShadow';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import AppButtonSecondary from './AppButtonSecondary';
import {ThumbPlaceholder} from './AppCommonComponents';
import AppStyles, {GetTextStyle} from '../config/style';
import {getFullUrl} from '../config/functions';
import { useTranslation } from 'react-i18next';

export default function AppCardDoctor({
  height = responsiveWidth(52),
  c_id = null,
  item,
  navigation,
  viewAll_pressed = () => console.log('View All Pressed...'),
  ...remainingBoxProps
}) {
  const {t, i18n} = useTranslation();
  const profile_image = getFullUrl(item?.avtar, 'doctors/' + item?._id + '/');

  const c_isVerified =
    item?.is_verified || item?.request_verification === 'verified';
  const name = `Dr. ${item?.firstName} ${item?.lastName}`;
  const c_degree =
    (item?.education && item?.education[0]?.highestQualification) || '';
  const c_distance = (item?.distance || 0) + ' '+t('kms');
  const experience = (item?.experience || 0) + ' '+t('years_exp');
  const c_consult_video = item?.consultation && item?.consultation[1];
  const c_consult_clinic = item?.consultation && item?.consultation[0];
  const c_specialty = item?.speciality;
  const c_specialtyIcon = item?.speciality?._id
    ? {
        uri: getFullUrl(
          item?.speciality.thumbnail,
          'specialists/' + item?.speciality._id + '/',
        ),
      }
    : require('../assets/images/sp_physician.png');

  return (
    <AppBoxShadow {...remainingBoxProps} height={height}>
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate('Doctor', {item});
        }}>
        <View style={styles.container}>
          <View style={styles.row_01}>
            <View style={styles.card_image_wrap}>
              {profile_image ? (
                <Image
                  style={styles.card_image}
                  source={{uri: profile_image}}
                />
              ) : (
                <ThumbPlaceholder
                  fName={item?.firstName}
                  lName={item?.lastName}
                  theme={1}
                />
              )}
              {c_isVerified && (
                <AutoHeightImage
                  width={12}
                  style={styles.online_status_image}
                  source={require('../assets/images/online_status.png')}
                />
              )}
            </View>

            <View style={styles.info_wrap}>
              <AppHeading style={styles.info_title}>{name}</AppHeading>
              <AppPara style={styles.info_subtitle}>{c_degree}</AppPara>
              <View style={{flexDirection: 'row'}}>
                <InfoPill text={experience} />
                {/* <InfoPill text={c_distance} /> */}
              </View>
            </View>
          </View>

          <View style={styles.row_02}>
            <View style={{flex: 1}}>
              <Text style={styles.consult_key}>{t("consult")}:</Text>
            </View>
            <View style={{flex: 3, flexDirection: 'row'}}>
              {c_consult_video && c_consult_video.available && (
                <View style={styles.consult_val}>
                  <MaterialCommunityIcons
                    name="video-outline"
                    style={styles.consult_icon('#0D6BC8', 2.8)}
                  />
                  <Text style={styles.consult_txt('#0D6BC8')}>
                    Video {'\u20B9'} {c_consult_video.fees_firstTime}
                  </Text>
                </View>
              )}
              {c_consult_clinic && c_consult_clinic.available && (
                <View style={styles.consult_val}>
                  <MaterialCommunityIcons
                    name="hospital-building"
                    style={styles.consult_icon('#63A115', 2.0)}
                  />
                  <Text style={styles.consult_txt('#63A115')}>
                    Clinic {'\u20B9'} {c_consult_clinic.fees_firstTime}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.row_03}>
            <View style={{flexDirection: 'row', ...AppStyles.centerXY}}>
              <AppBoxShadow
                width={responsiveWidth(100) * 0.08}
                height={responsiveWidth(100) * 0.08}
                borderRadius={25}
                style={{marginRight: 10}}
                content_style={AppStyles.centerXY}>
                <Image
                  style={styles.c_specialty_icon}
                  source={c_specialtyIcon}
                />
              </AppBoxShadow>
              <Text style={GetTextStyle('#2167C5', 1.8)}>
                {c_specialty?.title}
              </Text>
            </View>

            <View>
              <AppButtonSecondary
                width={responsiveWidth(25)}
                height={30}
                btPress={() => viewAll_pressed(c_specialty)}>
                <View style={{flexDirection: 'row', ...AppStyles.centerXY}}>
                  <Text
                    style={{
                      ...GetTextStyle('#0D6BC8', 1.6),
                      marginRight: 5,
                    }}>
                    VIEW ALL
                  </Text>
                  <Image
                    style={{
                      width: 20,
                      resizeMode: 'contain',
                    }}
                    source={require('../assets/images/icon_chevron_next.png')}
                  />
                </View>
              </AppButtonSecondary>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </AppBoxShadow>
  );
}

const InfoPill = ({text}) => <Text style={styles.info_pill}>{text}</Text>;

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(4),
  },
  row_01: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  card_image_wrap: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 5,
  },
  card_image: {
    flexBasis: '90%',
    aspectRatio: 1 / 1,
    borderRadius: 20,
    marginTop: 5,
  },
  online_status_image: {
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 10,
  },
  info_wrap: {
    flex: 3,
  },
  info_title: {
    ...GetTextStyle('#333333', 2),
    textAlign: 'left',
    marginBottom: 1,
  },
  info_subtitle: {
    ...GetTextStyle('#888888', 1.8),
    marginBottom: 6,
  },
  info_pill: {
    ...GetTextStyle('#2167C5', 1.6),
    textAlign: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: 5,
    borderColor: 'blue',
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 8,
  },
  row_02: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  consult_key: {
    ...GetTextStyle('#333333', 1.8),
  },
  consult_val: {
    flexDirection: 'row',
    marginRight: 15,
    ...AppStyles.centerXY,
  },
  consult_icon: (color, fontSize) => ({
    fontSize: responsiveFontSize(fontSize),
    color,
    marginRight: 5,
  }),
  consult_txt: (color) => ({
    fontSize: responsiveFontSize(1.7),
    color,
    fontWeight: 'bold',
  }),
  row_03: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  c_specialty_icon: {
    width: responsiveWidth(100) * 0.04,
    height: responsiveWidth(100) * 0.04,
    resizeMode: 'contain',
  },
});
