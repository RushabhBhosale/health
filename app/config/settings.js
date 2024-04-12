//import Constants from "expo-constants";
import {StatusBar} from 'react-native';

const settings = {
  dev: {
    envName: 'DEV',
    apiUrl: 'http://192.168.127.138:8000/node/api',
    cdnUrl: 'http://192.168.127.138:7000/cdnurl/',
    mapsApiKey: 'AIzaSyAXhh4Kd9Kvt6VmXiLxoZZST_iQIVggGIQ',
    authPhoneUrl: 'https://healthnovoindia.in/node/api/fmcuser/login/app',
    authPhoneVerifyUrl:
      'https://healthnovoindia.in/node/api/fmcuser/verify/app',
    agoraAppId: 'd5da55e6badc47a1b9aeae4077b789a0',
    agoraEncryptionKey: 'superDuperEncryptionKey',
    hnAdminId: '6011872f471224e9a0f63a09',
    razorPayKey: 'rzp_test_HEhQa0K7MPNa4S',
    playStoreLink:
      'https://play.google.com/store/apps/details?id=com.healthnovoindia.healthnovoplus',
    dummy_accounts: [],
  },
  staging: {
    envName: 'STAGE',
    apiUrl: 'https://beta.firstmileclinic.com/node/api',
    //apiUrl: 'http://143.110.185.63:8000/node/api',
    cdnUrl: 'http://143.110.185.63:7000/cdnurl/',
    mapsApiKey: 'AIzaSyAXhh4Kd9Kvt6VmXiLxoZZST_iQIVggGIQ',
    authPhoneUrl: 'http://143.110.185.63:8000/node/api/fmcuser/login/app',
    authPhoneVerifyUrl:
      'http://143.110.185.63:8000/node/api/fmcuser/verify/app',
    agoraAppId: 'd5da55e6badc47a1b9aeae4077b789a0',
    agoraEncryptionKey: 'superDuperEncryptionKey',
    hnAdminId: '6011872f471224e9a0f63a09',
    razorPayKey: 'rzp_test_HEhQa0K7MPNa4S',
    playStoreLink:
      'https://play.google.com/store/apps/details?id=com.healthnovoindia.healthnovoplus',
    dummy_accounts: [],
  },
  production: {
    envName: 'PROD',
    apiUrl: 'https://healthnovoindia.in/node/api',
    cdnUrl: 'https://healthnovoindia.in/cdnurl/',
    mapsApiKey: 'AIzaSyAXhh4Kd9Kvt6VmXiLxoZZST_iQIVggGIQ',
    authPhoneUrl: 'https://healthnovoindia.in/node/api/fmcuser/login/app',
    authPhoneVerifyUrl:
      'https://healthnovoindia.in/node/api/fmcuser/verify/app',
    agoraAppId: 'd5da55e6badc47a1b9aeae4077b789a0',
    agoraEncryptionKey: 'superDuperProductionEncryptionKey',
    hnAdminId: '6011872f471224e9a0f63a09',
    razorPayKey: 'rzp_live_ceIVIVFS9K7Aza',
    playStoreLink:
      'https://play.google.com/store/apps/details?id=com.healthnovoindia.healthnovoplus',
    dummy_accounts: [
      {phone: '+911234567890', otp: '123456'},
      {phone: '+910987654321', otp: '654321'},
    ],
  },
};

const getCurrentSettings = () => {
  //if (__DEV__) return settings.dev;

  // if (Constants.manifest.releaseChannel === "staging") return settings.staging;

  // return settings.dev;
  //return settings.staging;
  return settings.production;
};

export default getCurrentSettings;
