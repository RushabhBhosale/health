import React, {useEffect, useState} from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, DeviceEventEmitter, Platform, } from 'react-native';
import DeviceOrientation from 'react-native-orientation-locker';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';
import {NavigationContainer} from '@react-navigation/native';
import AuthNavigator from './app/navigation/AuthNavigator';
import AppNavigator from './app/navigation/AppNavigator';
import NavigationTheme from './app/navigation/NavigationTheme';
import OfflineNotice from './app/components/OfflineNotice';
import authApi from './app/api/auth';
import AppContext from './app/auth/appContext';
import AuthContext from './app/auth/context';
import CallContext from './app/auth/callContext';
import NotificationContext from './app/auth/notificationContext';
import fcmTokenApi from './app/api/fcmToken';
import notificationApi from './app/api/notification';
import authStorage from './app/auth/storage';
import {navigationRef, isReadyRef} from './app/navigation/rootNavigation';
import {getFullUrl} from './app/config/functions';
//import { registerRootComponent } from 'expo';
import KeepAwake from 'react-native-keep-awake';

import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
// import RNCallKeep from 'react-native-callkeep';

import IncomingCall from 'react-native-incoming-call';

let callStatus = '';
let loadedFromNotification = false;
let NotificationData = {};
let navigationLoaded = false;

let checkUnreadNotification = void 0;

export function handleRemoteMessage(remoteMessage, isHeadless) {
  console.log('handleRemoteMessage.app', remoteMessage);
  if (
    remoteMessage &&
    remoteMessage.data.type === 'call' &&
    remoteMessage.data.uuid
  ) {
    const doctor = JSON.parse(remoteMessage.data.doctorData);
    let drName = (doctor?.firstName || '') + ' ' + (doctor?.lastName || '');
    drName =
      drName === '' || drName === undefined ? doctor?.phone : 'Dr. ' + drName;
    let profile_image = getFullUrl(
      doctor?.avtar,
      'doctors/' + doctor?._id + '/',
    );

    IncomingCall.display(
      doctor?.phone, // Call UUID v4
      drName, // Username
      profile_image === '' ? 'https://healthnovoindia.com/wp-content/themes/health-novo/images/Health-Novo-_logo.png' : profile_image, // Avatar URL
      'Health Novo Incoming Video Call', // Info text
      40000, // Timeout for end call after 20s
    );

    // Listen to headless action events
    DeviceEventEmitter.addListener('endCall', async (payload) => {
      // End call action here
      console.log('endCall goes here');
      let dataObj = {
        uid: payload.uuid,
        channelName: remoteMessage.data.channelName,
        userId: doctor?.userId,
        status: 'declined',
      };
      const response = await notificationApi.updateVideoNotification(dataObj);
    });
    DeviceEventEmitter.addListener('answerCall', async (payload) => {
      console.log('answerCall', payload);
      if (payload.isHeadless) {
        // Called from killed state
        await IncomingCall.openAppFromHeadlessMode(payload.uuid);
      } else {
        // Called from background state
        await IncomingCall.backToForeground();
      }
      NotificationData = remoteMessage.data;
      loadedFromNotification = true;
    });
    // Could also persist data here for later uses
  }
  if (
    remoteMessage &&
    remoteMessage.data.type === 'complete' &&
    remoteMessage.data.uuid
  ) {
    console.log('complete ready...');
    callStatus = 'complete';
    // Could also persist data here for later uses
  } else if (
    remoteMessage &&
    remoteMessage.data.type === 'hanged' &&
    remoteMessage.data.uuid
  ) {
    console.log('hanged ready...');
    callStatus = 'hanged';
    // Could also persist data here for later uses
  } else if (remoteMessage?.type === 'Missed call') {
    console.log('dismiss goes here');
    IncomingCall.dismiss();
  } else {
    if (remoteMessage.notification?.body) {
      Alert.alert(
        'A new message arrived!',
        JSON.stringify(remoteMessage.notification?.body),
      );
      checkUnreadNotification();
    }
  }
}

const App = () => {
  const [AppOffline, set_AppOffline] = useState(false);
  const [user, setUser] = useState();
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [isReady, setIsReady] = useState(false);
  const [callStatus, setCallStatus] = useState(callStatus);

  const [ permission, setPermission ] = useState(false);
  const [ locationPermission, setLocationPermission ] = useState(false);
  const [ cameraPermission, setCameraPermission ] = useState(false);
  const [ notificationPermission, setNotificationPermission ] = useState(false);
  const [ audioPermission, setAudioPermission ] = useState(false);
  const [ phonePermission, setPhonePermission ] = useState(false);
  const [ storagePermission, setStoragePermission ] = useState(false);
  const [ hasUnreadNote, set_hasUnreadNote ] = useState(false);

  const app_context = {
    AppOffline,
    set_AppOffline,
  };

  useEffect(() => {
    DeviceOrientation.lockToPortrait();
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const isOffline = !(state.isConnected && state.isInternetReachable);
      set_AppOffline(isOffline);
    });

    return () => removeNetInfoSubscription();
  }, []);

  useEffect(() => {
    KeepAwake.activate();
    requestUserPermission();
  }, []);

  useEffect(() => {
    restoreUser();
    // const RNfirebaseConfig = {
    //   apiKey: "AIzaSyCU6b31BpgD0xZdmg01la6XLLjUlxkkIxY",
    //   projectId: "healthnovoplus",
    //   messagingSenderId: "1516630066",
    // };
    // firebase.initializeApp(RNfirebaseConfig);
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      if (loadedFromNotification) {
        setInitialRoute('VideoCall');
        NotificationData.isLoggedIn = true;
        loadedFromNotification = false;
      } else {
        setInitialRoute('Dashboard');
        // setInitialRoute('VideoCall');
      }
      checkUnreadNotification();
      messaging()
        .getToken()
        .then((token) => {
          saveToken(token);
        });
    } else {
      setInitialRoute('Welcome');
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage && remoteMessage.data.type === 'complete') {
        setCallStatus('complete');
      }
      handleRemoteMessage(remoteMessage);
    });

    return unsubscribe;
  }, []);

  /* Async api calls */
  checkUnreadNotification = async () => {
    if (user?._id) {
      const resp = await notificationApi.hasUnread('Patient', user._id);
      if (resp?.ok) {
        if (resp?.data?.success) set_hasUnreadNote(resp.data.has_unread);
      } else {
        console.log(
          resp?.data?.errors?.[0].msg ||
            'checkUnreadNotification api response error',
        );
      }
    }
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const restoreUser = async () => {
    const user = await authStorage.getUser();
    if (user) {
      const loginResult = await authApi.login({phone: user.phone});
      if (loginResult.ok) {
        if (loginResult?.data?.token) {
          checkAppPermissions();
          if (!permission) requestAppPermissions();
          await authStorage.setToken(loginResult.data.token);
          await authStorage.setUser(loginResult.data.user);
          setUser(loginResult.data.user);
        } else {
          await authStorage.removeToken();
          setInitialRoute('Welcome');
        }
      } else {
        if (loginResult.problem !== 'NETWORK_ERROR') {
          await authStorage.removeToken();
          setInitialRoute('Welcome');
        } else {
          setUser(user);
        }
      }
    } else {
      console.log(
        'User Not Found >>> loadedFromNotification',
        loadedFromNotification,
      );
      if (loadedFromNotification) {
        setInitialRoute('VideoCall');
        NotificationData.isLoggedIn = false;
        loadedFromNotification = false;
      } else {
        setInitialRoute('Welcome');
      }
    }
    setIsReady(true);
  };

  const saveToken = async (tokenIn) => {
    await authStorage.setTempFcmToken(tokenIn);
    console.log('firebase/messaging Token ======>', tokenIn);

    const authFcmToken = JSON.parse(await authStorage.getFcmToken());
    if (!authFcmToken || authFcmToken.device_token !== tokenIn) {
      var data = {
        userId: user._id,
        device_token: tokenIn,
        device_type: Platform.OS,
      };

      const fcmTokenResponse = await fcmTokenApi.addFcmToken(
        {token: data},
        user._id,
      );

      if (!fcmTokenResponse.ok) {
        console.error('Error Saving FCM Token to DB');
      } else {
        if (fcmTokenResponse?.data?.fcmToken?.token?.length) {
          await authStorage.setFcmToken(JSON.stringify(data));
        } else {
          console.log('Error Saving Token');
        }
      }
    }
  };

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

    const camera = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    camera === 'granted'
      ? setCameraPermission(true)
      : setCameraPermission(false);

    const {status, settings} = await requestNotifications(['alert', 'sound']);
    status === 'granted'
      ? setNotificationPermission(true)
      : setNotificationPermission(false);

    const audio = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    audio === 'granted' ? setAudioPermission(true) : setAudioPermission(false);

    const phone = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CALL_PHONE,
        //ios: PERMISSIONS.IOS.CAMERA,
      }),
    );
    phone === 'granted' ? setPhonePermission(true) : setPhonePermission(false);

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
    storage === 'granted' && writeStorage === 'granted'
      ? setStoragePermission(true)
      : setStoragePermission(false);
  };

  if (!isReady)
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0D6BC8" />
      </View>
    );

  return (
    <>
      <AppContext.Provider value={app_context}>
        <AuthContext.Provider value={{user, setUser}}>
          <CallContext.Provider value={{callStatus, setCallStatus}}>
            <NotificationContext.Provider
              value={{hasUnreadNote, set_hasUnreadNote}}>
              <OfflineNotice />
              <NavigationContainer
                ref={navigationRef}
                theme={NavigationTheme}
                onReady={() => {
                  navigationLoaded = true;
                  isReadyRef.current = true;
                }}>
                {initialRoute === 'Welcome' ? (
                  <AuthNavigator initialRoute={initialRoute} />
                ) : (
                  <AppNavigator
                    initialRoute={initialRoute}
                    screenProps={NotificationData}
                    hasUnreadNote={hasUnreadNote}
                    checkUnreadNotification={checkUnreadNotification}
                  />
                )}
              </NavigationContainer>
            </NotificationContext.Provider>
          </CallContext.Provider>
        </AuthContext.Provider>
      </AppContext.Provider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default App;
