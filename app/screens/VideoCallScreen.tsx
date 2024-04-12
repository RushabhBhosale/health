import React, {useRef, useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './requestPermission';
import notificationApi from '../api/notification';
import authStorage from '../auth/storage';
import videoTokenApi from '../api/videoToken';
import AuthContext from '../auth/context';
import CallContext from '../auth/callContext';
import * as RootNavigation from '../navigation/rootNavigation';

import AutoHeightImage from 'react-native-auto-height-image';
import AppStyles from '../config/style';
import KeepAwake from 'react-native-keep-awake';

import settings from '../config/settings';
const config = settings();

const dimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const appId = config.agoraAppId;
// const channelName = '60b7a3081af58e56ab4733a160b87b828b59d46d3f6463aa';
// const token =
//   '006d5da55e6badc47a1b9aeae4077b789a0IACV2fFxc4nRHJdMpqefSq2oUelMj/mwPIQYypVVv1E/oEnrI83pr4RpIgDL5gmxzJCqYwQAAQCMva5jAgCMva5jAwCMva5jBACMva5j';
// const uid = 90;

export default function VideoCallScreen({navigation, route, props, notification}) {
  const {user} = useContext(AuthContext);
  const {callStatus, setCallStatus} = useContext(CallContext);

  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user

  const [uid] = useState(Math.floor(Math.random() * 100));
  const [token, setToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const [notificationData, setNotificationData] = useState();
  //const [joinSucceed, setJoinSucceed] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [error, setError] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallCount, setIsCallCount] = useState(0);
  const [callStats, set_callStats] = useState({
    sec: '00',
    min: '00',
  });

  useEffect(() => {
		console.log("navigation.addListener => ", navigation.addListener);
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('notification => ', notification);
      setInitData(notification);
      setNotificationData(notification);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (callStatus === 'complete' || callStatus === 'hanged') {
      endCall();
    }
  }, [callStatus]);

  const setInitData = async (notification) => {
    if (notification) {
      setChannelName(notification?.channelName);
      await getVideoToken(notification?.channelName);
      if (callStatus === 'hanged') {
        endCall();
      }
    }

    KeepAwake.activate();
  };

  const getVideoToken = async (channel_name) => {
    console.log('getVideoToken channel_name => ', channel_name);
    console.log('getVideoToken.uid => ', uid);
    const videoTokenResponse = await videoTokenApi.getVideoToken(
      channel_name,
      uid,
    );
    console.log('getVideoToken.videoTokenResponse => ', videoTokenResponse);
    await setToken(videoTokenResponse.data.token);
    await setupVideoSDKEngine();
    await startVideoCall();
  };

  const endCall = async () => {
    const {uid, channelName, notificationData, user} = this.state;
    const duserId = JSON.parse(notificationData?.doctorData);
    const response = await notificationApi.updateVideoNotification({
      uid: uid,
      channelName: channelName,
      userId: duserId?.userId,
      status: 'disconnect',
    });
    if (response.ok) {
      //
    } else {
      console.log(
        'There has been issue with connecting to patient. Please try calling again.',
      );
    }

    await this._engine?.leaveChannel();

    if (notificationData?.isLoggedIn) {
      RootNavigation.navigate('AppointmentFeedback', {
        AppointmentId: notificationData.appointmentId,
      });
    } else {
      RootNavigation.navigate('Welcome');
    }
  };

  // useEffect(() => {
  //   // Initialize Agora engine when the app starts
  //   setupVideoSDKEngine();
  // });

  const setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };

  const startVideoCall = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  function showMessage(msg: string) {
    setMessage(msg);
  }

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>Agora Video Calling Quickstart</Text>
      <View style={styles.btnContainer}>
        <Text onPress={startVideoCall} style={styles.button}>
          Join
        </Text>
        <Text onPress={leave} style={styles.button}>
          Leave
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <React.Fragment key={0}>
            <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
            <Text>Local user uid: {uid}</Text>
          </React.Fragment>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <React.Fragment key={remoteUid}>
            <RtcSurfaceView
              canvas={{uid: remoteUid}}
              style={styles.videoView}
            />
            <Text>Remote user uid: {remoteUid}</Text>
          </React.Fragment>
        ) : (
          <Text>Waiting for a remote user to join</Text>
        )}
        <Text style={styles.info}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
  scrollContainer: {alignItems: 'center'},
  videoView: {width: '90%', height: 200},
  btnContainer: {flexDirection: 'row', justifyContent: 'center'},
  head: {fontSize: 20},
  info: {backgroundColor: '#ffffe0', color: '#0000ff'},
});
