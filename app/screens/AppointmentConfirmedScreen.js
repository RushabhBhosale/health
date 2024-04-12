import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import moment from 'moment';
import ScreenScrollable from '../components/ScreenScrollable';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppBoxShadow from '../components/AppBoxShadow';
import AutoHeightImage from 'react-native-auto-height-image';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppButtonPrimary from '../components/AppButtonPrimary';
import {ThumbPlaceholder} from '../components/AppCommonComponents';
import {ToComePopup} from '../utility/alert-boxes';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {getFullUrl, makeFullName} from '../config/functions';

const WIDTH = Container_Width;
const THUMB_BORDER_RADIUS = 18;
const VIDEO_ICON = require('../assets/images/icon_video.png');
const CLINIC_ICON = require('../assets/images/icon_building.png');

export default function AppointmentConfirmedScreen({navigation, route}) {
  const [is_reschedule, set_is_reschedule] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(false);

  /* ===== Side Effects ===== */
  useEffect(() => {
    if (route?.params?.IS_RESCHEDULE) set_is_reschedule(true);
  }, [route, route.params]);

  useEffect(() => {
    if (route?.params?.appointmentInfo)
      setAppointmentInfo(route.params.appointmentInfo);
  }, [route, route.params]);

  const profile_image = getFullUrl(
    appointmentInfo?.doctorData?.avtar,
    'doctors/' + appointmentInfo?.doctorId + '/',
  );

  return (
    <View style={styles.mainContainer}>
      <ScreenScrollable>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>
              Your appointment {'\n'}has been{' '}
              {is_reschedule ? 'Rescheduled' : 'confirmed'}
            </AppHeading>
          </View>

          <View style={{marginBottom: 33}}>
            <AppBoxShadowInner
              aspect_ratio={241 / 297}
              content_style={AppStyles.centerXY}>
              <View style={styles.card}>
                <View style={styles.cd_icon_wrap}>
                  <AutoHeightImage
                    width={25}
                    source={
                      appointmentInfo?.consultTypeName === 'Video'
                        ? VIDEO_ICON
                        : CLINIC_ICON
                    }
                    style={{marginRight: 0}}
                  />
                </View>
                <AppBoxShadow
                  width={responsiveWidth(100) * 0.21}
                  aspect_ratio={1 / 1}
                  borderRadius={THUMB_BORDER_RADIUS}
                  style={{marginBottom: 10}}>
                  {profile_image ? (
                    <Image
                      style={styles.cd_thumb}
                      source={{uri: profile_image}}
                    />
                  ) : (
                    <ThumbPlaceholder
                      fName={appointmentInfo?.doctorData?.firstName}
                      lName={appointmentInfo?.doctorData?.lastName}
                    />
                  )}
                </AppBoxShadow>
                <AppHeading style={GetTextStyle(undefined, 2.4, 'bold')}>
                  {makeFullName(
                    appointmentInfo?.doctorData?.firstName,
                    appointmentInfo?.doctorData?.lastName,
                    'Dr.',
                  )}
                </AppHeading>
                <View>
                  <Text
                    style={[
                      GetTextStyle(undefined, 2.0, 'bold', 'center'),
                      {marginBottom: 3},
                    ]}>
                    {appointmentInfo?.consultTypeName + ' Consultation'}
                  </Text>
                  <Text
                    style={GetTextStyle(undefined, 1.7, undefined, 'center')}>
                    {moment
                      .utc(appointmentInfo?.appointmentDate)
                      .format('ddd, D MMM')}
                    , {appointmentInfo?.appointmentTime}
                  </Text>
                </View>
              </View>
            </AppBoxShadowInner>
          </View>

          <View style={styles.section}>
            <AppPara style={GetTextStyle(undefined, 1.8, undefined, 'center')}>
              All details related to the appointment Is available in the booking
              section
            </AppPara>
          </View>

          <AppButtonPrimary
            btTitle={'VIEW BOOKING'}
            width={responsiveWidth(100) * 0.57}
            aspect_ratio={0.23}
            style={{marginBottom: 20}}
            btPress={() =>
              navigation.navigate('AppointmentDetail', {
                detail: appointmentInfo,
              })
            }
          />

          {/* <AppButtonSecondary
            btTitle={'SHARE THIS BOOKING'}
            width={responsiveWidth(100) * 0.57}
            aspect_ratio={0.23}
            fontSize={responsiveFontSize(2.2)}
            style={{marginBottom: 20}}
            btPress={ToComePopup}
          /> */}

          <AppButtonSecondary
            btTitle={'CLOSE'}
            width={responsiveWidth(100) * 0.18}
            height={23}
            shadowRadius={2}
            borderRadius={6}
            btPress={() => {
              console.log('close...');
              navigation.navigate('Appointment');
            }}
          />
        </View>
      </ScreenScrollable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 36,
  },
  card: {
    flex: 1,
    width: '100%',
    ...AppStyles.centerXY,
  },
  cd_icon_wrap: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  cd_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
  },
  section: {width: '78%', marginBottom: 20},
});
