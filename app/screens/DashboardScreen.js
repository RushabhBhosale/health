import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import DashboardOverlay from '../components/DashboardOverlay';
import ScreenScrollable from '../components/ScreenScrollable';
import AppBoxShadow from '../components/AppBoxShadow';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppProgressBar from '../components/AppProgressBar';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppCardDoctor from '../components/AppCardDoctor';
import AppPanelDashboard from '../components/AppPanelDashboard';
import AppPanelBasic from '../components/AppPanelBasic';
import {ThumbPlaceholder} from '../components/AppCommonComponents';
import AppStyles, {Container_Width} from '../config/style';
import AppErrorMessage from '../components/AppErrorMessage';
import AuthContext from '../auth/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingIndicator from '../components/LoadingIndicator';
import doctorsApi from '../api/doctors';
import {getFullUrl} from '../config/functions';
import appointmentApi from '../api/appointment';
import pathologyApi from '../api/pathology';
import OverlayPermissionModule from 'rn-android-overlay-permission';
import {makeFullName} from '../config/functions';
import {ToComePopup} from '../utility/alert-boxes';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18next';

const WIDTH = Container_Width;
const THUMB_BORDER_RADIUS = 18;

export default function DashboardScreen({navigation, route}) {
  // navigation.navigate('BookTest');
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  const [userName, set_userName] = useState('Guest');
  const [profileStatus, set_profileStatus] = useState(0);
  const [Doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOverlayActive, setOverlay] = useState(false);
  const [isProfileComplete, setProfileComplete] = useState(false);

  const [permission, setPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [phonePermission, setPhonePermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [nextAppointment, set_nextAppointment] = useState(null);

  function resetStates() {
    setError('');
  }

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      resetStates();
      setOverlayState();
      setNextAppointment(
        await fetchNextAppointment(),
        await fetchNextPathology(),
      );
      loadDoctor();
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    resetUser();
  }, [user]);

  useEffect(() => {
    if (profileStatus === 100) {
      if (!isProfileComplete) setProfileComplete(true);
    }
  }, [profileStatus]);

  useEffect(() => {
    checkAppPermissions();
  }, [
    permission,
    locationPermission,
    cameraPermission,
    notificationPermission,
    audioPermission,
    phonePermission,
    storagePermission,
  ]);

  const checkAppPermissions = async () => {
    const location = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
    );
    location === 'granted'
      ? setLocationPermission(true)
      : setLocationPermission(false);
  
    i18n.changeLanguage('en');

    const camera = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    camera === 'granted'
      ? setCameraPermission(true)
      : setCameraPermission(false);

    const {status, settings} = await checkNotifications();
    status === 'granted'
      ? setNotificationPermission(true)
      : setNotificationPermission(false);

    const audio = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    audio === 'granted' ? setAudioPermission(true) : setAudioPermission(false);

    const phone = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.CALL_PHONE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    phone === 'granted' ? setPhonePermission(true) : setPhonePermission(false);

    const storage = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    const writeStorage = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    storage === 'granted' && writeStorage === 'granted'
      ? setStoragePermission(true)
      : setStoragePermission(false);

    if (Platform.OS === 'android') {
      OverlayPermissionModule.isRequestOverlayPermissionGranted((status) => {
        if (status) {
          Alert.alert(
            'Overlay Permissions',
            'Overlay Permission is required for showing video call notification',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () =>
                  OverlayPermissionModule.requestOverlayPermission(),
              },
            ],
            {cancelable: false},
          );
        }
      });
    }

    if (
      location === 'granted' &&
      camera === 'granted' &&
      audio === 'granted' &&
      phone === 'granted' &&
      storage === 'granted' &&
      status === 'granted'
    ) {
      setPermission(true);
    }
  };

  /* Async api calls */
  const fetchNextAppointment = async () => {
    setIsLoading(true);
    let latest_apnt = null;
    try {
      const resp = await appointmentApi.getUpcomingAppointments(user._id);
      if (resp?.ok) {
        if (resp?.data?.length) latest_apnt = resp.data[0];
      } else {
        setError(resp?.data?.errors?.[0]?.msg);
      }
    } catch (error) {
      console.log('appointmentApi.getUpcomingAppointments catch =>', error);
      setError(error?.message || 'Error in fetching Upcoming Appointments');
    }
    setIsLoading(false);
    return latest_apnt;
  };

  const fetchNextPathology = async () => {
    setIsLoading(true);
    let latest_path = null;
    try {
      const resp = await pathologyApi.getUpcomingPathologies(user._id);
      if (resp?.ok) {
        if (resp?.data?.length) latest_path = resp.data[0];
      } else {
        setError(resp?.data?.errors?.[0]?.msg);
      }
    } catch (error) {
      console.log('appointmentApi.getUpcomingPathologies catch =>', error);
      setError(error?.message || 'Error in fetching Upcoming Appointments');
    }
    setIsLoading(false);
    return latest_path;
  };

  const openVideos = async () => {
    console.log("VIDEO OPEN REQUESTED!");
    navigation.navigate('Wellness_Videos')
  }

  const loadDoctor = async () => {
    try {
      const resp = await doctorsApi.getDoctorByRelevance(user._id);
      if (resp?.ok) {
        if (resp?.data?.length) setDoctors(resp.data);
      } else {
        setError(resp?.data?.errors?.[0]?.msg);
      }
    } catch (error) {
      setError('Error in loading doctors');
    }
    setIsLoading(false);
  };

  /* Functions */
  function resetUser() {
    if (user) {
      let uName = makeFullName(user.firstName, user.lastName);
      uName = uName ? uName : 'Guest';
      let pfStatus = 10;
      if (user.firstName || user.lastName) pfStatus += 10;
      if (user.email) pfStatus += 10;
      if (user.dob) pfStatus += 10;
      if (user.gender) pfStatus += 10;
      if (user.height) pfStatus += 10;
      if (user.weight) pfStatus += 10;
      if (user.bloodGroup) pfStatus += 10;
      if (user.pincode) pfStatus += 10;
      if (user.avtar) pfStatus += 10;
      set_profileStatus(pfStatus);
      set_userName(uName);
    }
  }

  const toggleOverlay = async () => {
    setOverlay(!isOverlayActive);
    await AsyncStorage.setItem('showDashOverlay', 'false');
  };

  const setOverlayState = async () => {
    const overlay = await AsyncStorage.getItem('showDashOverlay');
    overlay === 'false' ? setOverlay(false) : setOverlay(true);
  };

  function setNextAppointment(nextApnt, nextPath) {
    let next_apnt = null;
    if (nextApnt && nextPath) {
      next_apnt = moment(nextApnt.appointmentDate).isSameOrBefore(
        nextPath.appointmentDate,
      )
        ? nextApnt
        : nextPath;
    } else {
      next_apnt = nextApnt ? nextApnt : nextPath;
    }
    set_nextAppointment(next_apnt);
  }

  return (
    <>
      <ScreenScrollable style={styles.mainContainer}>
        <LoadingIndicator visible={isLoading} />
        <View style={styles.app_logo}>
          <AutoHeightImage
            width={responsiveWidth(100) * 0.16}
            source={require('../assets/logo.png')}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.section}>
            {!isProfileComplete ? (
              <IncompleteProfile
                userName={userName}
                profileStatus={profileStatus}
                navigation={navigation}
                user={user}
              />
            ) : (
              <CompleteProfile
                userName={userName}
                user={user}
                nextApnt={nextAppointment}
                navigation={navigation}
              />
            )}
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <View style={{...styles.section, marginBottom: 15}}>
            <AppPara style={{...styles.section_title, marginBottom: 5}}>
              {t("home_book")}
            </AppPara>
            <View
              style={{
                width: responsiveWidth(100),
                height: responsiveWidth(58),
                alignSelf: 'center',
              }}>
              <FlatList
                data={Doctors}
                renderItem={RenderDoctorCard(navigation)}
                keyExtractor={CardKeyExtractor}
                horizontal
              />
            </View>
          </View>

          <View style={styles.section}>
            <AppPara style={styles.section_title}>
              {t("what_today")}
            </AppPara>

            <AppPanelDashboard
              backgroundColor={'#55BEFF'}
              borderColor={'#CEECFC'}
              image={require('../assets/images/heart_care.png')}
              caption={t('expert_recommendation')}
              title={t('self_diagnos')}
              para={t('self_diagnos_descr')}
              para_color={'#0D4A71'}
              action_title={'BOOK'}
              action_color={'#4D9FF0'}
              action_function={() => {
                navigation.navigate('Appointment');
              }}
              style={{marginBottom: 12}}
            />
            <AppPanelDashboard
              backgroundColor={'#F4B550'}
              borderColor={'#FCE8D3'}
              image={require('../assets/images/medicines.png')}
              caption={t('health_records')}
              title={t('purchase_medication')}
              para={t('purchase_medication_descr')}
              para_color={'#8B5602'}
              action_title={'Buy'}
              action_color={'#C6A057'}
              action_function={ToComePopup}
              style={{marginBottom: 12}}
            />
            <AppPanelDashboard
              backgroundColor={'#DF73FF'}
              borderColor={'#E3CFE9'}
              image={require('../assets/images/mental-wellness.png')}
              caption={t('mental_wellness')}
              title={t('health_education')}
              para={t('mental_wellness_descr')}
              para_color={'#4B0082'}
              action_title={'Watch Now'}
              action_color={'#4D9FF0'}
              action_function={openVideos}
              style={{marginBottom: 12}}
            />
            <AppPanelDashboard
              backgroundColor={'#7DC637'}
              borderColor={'#D4F6C0'}
              image={require('../assets/images/icon_ambulance.png')}
              caption={t('health_records')}
              title={t('capture_vitals')}
              para={t('capture_vitals_descr')}
              para_color={'#30550B'}
              action_title={'Book'}
              action_color={'#91B56D'}
              action_function={ToComePopup}
              style={{marginBottom: 12}}
            />
            <AppPanelDashboard
              backgroundColor={'#55BEFF'}
              borderColor={'#CEECFC'}
              image={require('../assets/images/icon-insurance.png')}
              caption={t('insurance_caption')}
              title={t('insurance_title')}
              para={t('insurance_descr')}
              para_color={'#0D4A71'}
              action_title={'INSURE NOW'}
              action_color={'#4D9FF0'}
              action_function={() => {
                navigation.navigate('insurance_form');
              }}
              style={{marginBottom: 42}}
            />
            {/* <AppPanelBasic
              backgroundColor={'#96D9CF'}
              color={'#555555'}
              borderColor={'#FCE8D3'}
              image={require('../assets/images/phone_held.png')}
              caption={'Expert Recommendation'}
              title={'Self Diagnosis'}
              para={'We help you with tips and tricks'}
              para_color={'#8B5602'}
              isButton={true}
              action_title={'SHARE NOW'}
              action_color={'#69BCB0'}
              action_function={null}
              style={{marginBottom: 20}}
            /> */}
          </View>
        </View>
      </ScreenScrollable>
      {isOverlayActive && (
        <DashboardOverlay
          isVisible={isOverlayActive}
          overlayPress={toggleOverlay}
        />
      )}
    </>
  );
}

const IncompleteProfile = ({userName, profileStatus, navigation, user}) => {
  const {t, i18n} = useTranslation();

  return (
    <AppBoxShadowInner
      height={responsiveWidth(50)}
      content_style={AppStyles.centerXY}>
      <View style={styles.card}>
        <AppHeading style={styles.card_title}>{t("home_book")} {userName},</AppHeading>
        <AppPara style={styles.card_subtitle}>{t("welcome")}</AppPara>
        <AppPara style={styles.card_text}>
          {t("complete_profile")}
        </AppPara>
        <AppProgressBar
          width={'80%'}
          progress={profileStatus}
          style={{marginBottom: 25}}
        />
        <AppButtonPrimary
          btPress={() =>
            navigation.navigate('EditPersonalDetails', {
              number: user.phone,
              redirect: 'dashboard',
            })
          }
          style={{alignSelf: 'center'}}
          width={responsiveWidth(50)}
          height={45}
          shadowRadius={2}>
          <Text style={styles.card_button_text}>{t("update_profile")}</Text>
        </AppButtonPrimary>
      </View>
    </AppBoxShadowInner>
  );
};

const CompleteProfile = ({userName, user, nextApnt, navigation}) => {
  //const { t } = useTranslation();
  const {t, i18n} = useTranslation();
  const profile_image = getFullUrl(user?.avtar, 'patients/' + user?._id + '/');

  const AppointmentDate = moment(nextApnt?.appointmentDate).format(
    'Do MMMM YYYY',
  );
  const AppointmentTime = nextApnt?.appointmentTime;
  const DrName = makeFullName(
    nextApnt?.doctorData?.firstName,
    nextApnt?.doctorData?.lastName,
  );

  return (
    <AppBoxShadowInner
      height={responsiveWidth(50)}
      content_style={AppStyles.centerXY}>
      <View style={styles.card}>
        <AppBoxShadow
          width={responsiveWidth(22)}
          height={responsiveWidth(22)}
          borderRadius={THUMB_BORDER_RADIUS}
          style={{marginBottom: 10}}>
          {profile_image ? (
            <Image style={styles.profile_thumb} source={{uri: profile_image}} />
          ) : (
            <ThumbPlaceholder fName={user?.firstName} lName={user?.lastName} />
          )}
        </AppBoxShadow>
        <AppHeading style={styles.profile_title}>{t("hello")} {userName},</AppHeading>
        {nextApnt?._id ? (
          <>
            <AppPara style={styles.profile_subtitle}>
              {t("you_have_appointment")} on
              <Text style={styles.boldText}>
                {' '}
                {AppointmentDate}, {AppointmentTime}{' '}
              </Text>
              {nextApnt.pathology ? (
                <Text>
                  at <Text style={styles.boldText}></Text>
                </Text>
              ) : (
                <Text>
                  with<Text style={styles.boldText}> {DrName}</Text>
                </Text>
              )}
            </AppPara>
            <View style={styles.profile_btn_gp}>
              <View
                style={{
                  flex: 1,
                  // paddingRight: 10,
                }}>
                <AppButtonPrimary
                  btTitle={t('view_booking')}
                  style={{alignSelf: 'center'}}
                  width={responsiveWidth(100) * 0.32}
                  aspect_ratio={0.26}
                  shadowRadius={2}
                  borderRadius={5}
                  textSize={responsiveFontSize(1.6)}
                  gradientBorderWidth={2}
                  btPress={() =>
                    navigation.navigate(
                      nextApnt.pathology
                        ? 'PathologyDetail'
                        : 'AppointmentDetail',
                      {
                        detail: nextApnt,
                      },
                    )
                  }
                />
              </View>
              {/* <View
                style={{
                  flex: 1,
                  paddingLeft: 10,
                }}>
                <AppButtonSecondary
                  btTitle={'RESCHEDULE'}
                  style={{alignSelf: 'flex-start'}}
                  width={responsiveWidth(100) * 0.32}
                  aspect_ratio={0.26}
                  shadowRadius={2}
                  borderRadius={5}
                  btPress={() =>
                    navigation.navigate('AppointmentDetail', {
                      detail: nextApnt,
                    })
                  }
                />
              </View> */}
            </View>
          </>
        ) : (
          <>
            <AppPara style={styles.profile_subtitle}>
              {t("noappointment")}
            </AppPara>
            {/* <View style={styles.profile_btn_gp}>
              <View>
                <AppButtonPrimary
                  btTitle={'BOOK APPOINTMENT'}
                  // style={{alignSelf: 'flex-end'}}
                  width={responsiveWidth(49)}
                  height={50}
                  shadowRadius={2}
                  textSize={responsiveFontSize(1.8)}
                  btPress={() => console.log('View button pressed...')}
                />
              </View>
            </View> */}
          </>
        )}
      </View>
    </AppBoxShadowInner>
  );
};

const RenderDoctorCard = (navigation) => ({item, index}) => {
  let margin_L = (responsiveWidth(100) - WIDTH) / 2;
  let first_item = !index ? {marginLeft: margin_L} : {};

  const navigateToFindDoctor = (item) => {
    const spectArr = item ? [item] : [];
    navigation.navigate('FindDoctor', {
      screen: 'FindDoctor',
      params: {specialistsArray: spectArr},
    });
  };

  return (
    <View
      style={{
        width: responsiveWidth(87),
        alignItems: 'flex-start',
        justifyContent: 'center',
        ...first_item,
      }}>
      <AppCardDoctor
        item={item}
        navigation={navigation}
        viewAll_pressed={navigateToFindDoctor}
      />
    </View>
  );
};

const CardKeyExtractor = (item, index) => 'slide-' + index;

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  app_logo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  content: {
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  section: {
    marginBottom: 10,
  },
  section_title: {
    fontSize: responsiveFontSize(2.2),
    marginBottom: 10,
  },
  card: {
    flex: 1,
    width: '90%',
    ...AppStyles.centerXY,
  },
  card_title: {
    marginBottom: 7,
  },
  card_subtitle: {
    fontWeight: 'bold',
    marginBottom: 7,
  },
  card_text: {
    marginBottom: 10,
    textAlign: 'center',
  },
  card_button_text: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    color: AppStyles.colors.btnText,
    backgroundColor: 'transparent',
  },
  profile_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
  },
  profile_title: {marginBottom: 2},
  profile_subtitle: {textAlign: 'center', marginBottom: 15},
  profile_btn_gp: {
    width: WIDTH,
    flexDirection: 'row',
  },
  boldText: {
    fontWeight: 'bold',
  },
});
