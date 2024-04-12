import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  View,
  Alert,
  Platform,
} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import LinearGradient from 'react-native-linear-gradient';
import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import PermissionItem from '../components/PermissionItem';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppStyles, {IsAndroid} from '../config/style';

import OverlayPermissionModule from "rn-android-overlay-permission";

if (Platform.OS === "android") {
  OverlayPermissionModule.isRequestOverlayPermissionGranted((status) => {
    if (status) {
      Alert.alert(
        "Overlay Permissions",
        "Overlay Permission is required for showing video call notification",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => OverlayPermissionModule.requestOverlayPermission(),
          },
        ],
        { cancelable: false }
      );
    }
  });
}

export default function PermissionContent({navigation, redirect, data = []}) {
  const [permission, setPermission] = useState(true);

  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [phonePermission, setPhonePermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);

  useEffect(() => {
    checkAppPermissions();
  }, [
    permission,
    locationPermission,
    cameraPermission,
    notificationPermission,
    audioPermission,
    phonePermission,
    storagePermission
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
    audio === 'granted'
      ? setAudioPermission(true)
      : setAudioPermission(false);
    
    const phone = await check(
      Platform.select({
        android: PERMISSIONS.ANDROID.CALL_PHONE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    phone === 'granted'
      ? setPhonePermission(true)
      : setPhonePermission(false);

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
    (storage === 'granted' && writeStorage  === 'granted')
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

  const requestAppPermissions = async () => {
    const location = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
    );
    location === 'granted'
      ? setLocationPermission(true)
      : setLocationPermission(false);
    console.log('location', location);

    const camera = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    camera === 'granted'
      ? setCameraPermission(true)
      : setCameraPermission(false);
    console.log('camera', camera);

    const {status, settings} = await requestNotifications(['alert', 'sound']);
    status === 'granted'
      ? setNotificationPermission(true)
      : setNotificationPermission(false);
    console.log('Notification', status);

    const audio = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    audio === 'granted'
      ? setAudioPermission(true)
      : setAudioPermission(false);
    console.log('audio', audio);


    const phone = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CALL_PHONE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    phone === 'granted'
      ? setPhonePermission(true)
      : setPhonePermission(false);
    console.log('phone', phone);


    const storage = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    const writeStorage = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    (storage === 'granted' && writeStorage  === 'granted')
      ? setStoragePermission(true)
      : setStoragePermission(false);
    console.log('storage', storage);
  };

  return (
    <View style={styles.content}>
      <ImageBackground
        source={require('../assets/images/background-phone.png')}
        style={styles.backgroundImg}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={[
            AppStyles.colors.bgGradient01,
            AppStyles.colors.bgGradient02,
            AppStyles.colors.lightgrey,
            AppStyles.colors.lightgrey,
          ]}
          style={styles.linearGradient}>
          {/* <Image
          source={require('../assets/images/background-image-3.png')}
          resizeMethod={'scale'}
          style={styles.Img}
        /> */}
          <View style={styles.section01}>
            <Image
              style={styles.iconImg}
              source={require('../assets/images/lock-icon.png')}
            />
          </View>

          <View style={styles.section02}>
            {data.map((item, i) => {
              let bBottom = i === data.length - 1 ? false : true;
              return (
                <PermissionItem
                  key={'prmItem-' + i}
                  pText={item.title}
                  iSrc={item.icon.src}
                  borderBottom={bBottom}
                  id={item.id}
                  locationPermission={locationPermission}
                  cameraPermission={cameraPermission}
                  notificationPermission={notificationPermission}
                />
              );
            })}
          </View>

          <View style={styles.section03}>
            {permission ? (
              redirect === 'Login' ? (
                  <AppButtonPrimary
                    btTitle={'NEXT'}
                    btPress={() => {
                      navigation.navigate('Login');
                    }}
                  />
                ) : (
                  <AppButtonPrimary
                    btTitle={'NEXT'}
                    btPress={() => {
                      navigation.navigate('Register');
                    }}
                />
                )
            ) : (
              <AppButtonPrimary
                btTitle={'TURN ON'}
                btPress={() => {
                  requestAppPermissions();
                }}
              />
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // overflow: 'scroll',
  },
  backgroundImg: {
    flex: 1,
    // flexBasis: '100%',
    justifyContent: 'center',
    // width: IsAndroid ? responsiveWidth(69) : responsiveWidth(80),
    // width: '100%',
    // height: '100%',
    // maxHeight: '90%',
    aspectRatio: 387 / 768, //516 / 587, //774 / 1000,
    resizeMode: 'contain',
  },
  Img: {
    flex: 1,
    // justifyContent: 'center',
    // width: IsAndroid ? responsiveWidth(69) : responsiveWidth(80),
    // width: '100%',
    // height: '90%',
    // aspectRatio: 516 / 587,
    resizeMode: 'contain',
    // position: 'absolute',
    // top: 0,
    // right: 0,
    // bottom: 0,
    // left: 0,
  },
  linearGradient: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // overflow: 'hidden',
    // position: 'relative',
  },
  section01: {},
  iconImg: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    resizeMode: 'contain',
  },
  section02: {},
  section03: {},
});
