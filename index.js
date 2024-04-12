/**
 * @format
 */
'use strict';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App, { handleRemoteMessage } from './App';
import { name as appName } from './app.json';

import PushNotification from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

export const IsAndroid = Platform.OS === 'android' ? true : false;

// //ANDROID CONFIG - COMMENT IT FOR IOS BUILD
PushNotification.configure({
    onRegister: function(token) {
        console.log("REMINDER ALERT TOKEN: ", token);
    },
    onNotification: function(notification) {
        console.log("REMINDER ALERT NOTIFICATION", notification);
    },
    popInitialNotification: true,
    //requestPermissions: true,
});

PushNotification.getScheduledLocalNotifications(rn => {
    console.log("LOCAL NOTIFICATION IOS:", rn);
});

// IOS CONFIG - COMMENT IT FOR ANDROID BUILD

// const RNfirebaseConfig = {
//       apiKey: "AIzaSyCU6b31BpgD0xZdmg01la6XLLjUlxkkIxY",
//       projectId: "healthnovoplus",
//       messagingSenderId: "1516630066",
//       appId: '1:1516630066:ios:8d52cdedf97a84290c4c2b',
//       databaseURL: '',
//       storageBucket: '',
//     };
// firebase.initializeApp(RNfirebaseConfig);

// const type = 'notification';
// PushNotificationIOS.addEventListener(type, onRemoteNotification);

// const onRemoteNotification = (notification) => {
//     const isClicked = notification.getData().userInteraction === 1;

//     if (isClicked) {
//         // Navigate user to another screen
//     } else {
//         // Do something else with push notification
//     }
//     // Use the appropriate result based on what you needed to do for this notification
//     const result = PushNotificationIOS.FetchResult.NoData;
//     notification.finish(result);
// };

// PushNotificationIOS.getPendingNotificationRequests(rn => {
//     console.log("LOCAL NOTIFICATION IOS:", rn);
// });

messaging().setBackgroundMessageHandler(async remoteMessage => {
    handleRemoteMessage(remoteMessage, true);
});

//AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('HN Plus', () => App);