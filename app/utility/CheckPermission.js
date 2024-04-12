import {
    Platform,
  } from 'react-native';

export const checkAppPermissions = async () => {
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

    if (
      location === 'granted' &&
      camera === 'granted' &&
      status === 'granted'
    ) {
      setPermission(true);
    }

    
  };