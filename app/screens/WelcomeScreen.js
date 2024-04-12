import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, BackHandler, ToastAndroid} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import AppLogo from '../components/AppLogo';
import AppSlider from '../components/AppSlider';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import featuresApi from '../api/features';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import AppStyles from '../config/style';

let goBackCount = 0;

export default function WelcomeScreen({navigation, route}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [permission, setPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [phonePermission, setPhonePermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [featuresData, set_featuresData] = useState([]);
  const [isScreenFocused, set_isScreenFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      loadDetails();
    });
    return unsubscribe;
  }, []);

  useFocusEffect(() => {
    set_isScreenFocused(true);
    return () => {
      set_isScreenFocused(false);
    };
  });

  useEffect(() => {
    navigation.addListener('beforeRemove', (event) => {
      if (event?.data?.action?.type === 'GO_BACK') {
        goBackCount++;
        setTimeout(() => {
          goBackCount = 0;
        }, 1500);

        if (goBackCount < 2) {
          event.preventDefault();
          ToastAndroid.show('Press again to exit', Android.SHORT);
        } else {
          BackHandler.exitApp();
        }
      }
    });
  }, []);

  /* ===== Async API calls ===== */
  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const resp = await featuresApi.getFeatures();
      if (resp?.ok) {
        if (resp?.data?.length) set_featuresData(resp.data);
        else setError('No features data found');
      } else {
        setError(resp?.data?.errors?.[0]?.msg || 'Error Loading the features');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching About', error);
      setError(error);
    }
  };

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

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <AppLogo width={responsiveWidth(16.5)} />
      </View>

      <LoadingIndicator visible={isLoading} />

      {error !== '' && (
        <View>
          <AppErrorMessage showMsg={true} error={error} />
        </View>
      )}

      {isScreenFocused && featuresData?.length ? (
        <View style={styles.carousel}>
          <AppSlider slides={featuresData} currentSlide={currentSlide} />
        </View>
      ) : null}

      <View style={styles.section}>
        <AppButtonPrimary
          btTitle={'GET STARTED'}
          btPress={() => {
            navigation.navigate('Permission', {redirect: 'Register'});
          }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.textLine}>Already have an account?</Text>

        {permission ? (
          <AppButtonSecondary
            btTitle={'LOGIN'}
            width={responsiveWidth(20)}
            height={28}
            btPress={() => {
              navigation.navigate('Login');
            }}
          />
        ) : (
          <AppButtonSecondary
            btTitle={'LOGIN'}
            width={responsiveWidth(20)}
            height={28}
            btPress={() => {
              navigation.navigate('Permission', {redirect: 'Login'});
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: AppStyles.colors.lightgrey,
  },
  header: {
    flex: 2,
  },
  carousel: {
    flex: 8,
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLine: {
    fontSize: responsiveFontSize(1.5),
    color: AppStyles.colors.darkgrey,
    marginRight: 20,
  },
});
