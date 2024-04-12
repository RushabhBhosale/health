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

export default function VideoCallScreen({
  navigation,
  route,
  props,
  notification,
}) {
  const {user} = useContext(AuthContext);
  const {callStatus, setCallStatus} = useContext(CallContext);

  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user

  const [uid] = useState(Math.floor(Math.random() * 100));//0
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
    console.log('navigation', navigation);
    console.log('route', route);
    console.log('props', props);
    console.log('notification', notification);

    // let notification = {
    //   appointmentId: '624a9c10ee399891d68d86f0',
    //   channelName: '60b7a3081af58e56ab4733a160b87b828b59d46d3f6463aa',
    //   doctorData: {userId: '6242985d6c0981e51899113b'},
    //   duuid: '60b87b828b59d46d3f6463aa',
    //   isLoggedIn: true,
    //   priority: 'high',
    //   type: 'call',
    //   uuid: '60b7a3081af58e56ab4733a1',
    // };

    setNotificationData(notification);

    // const unsubscribe = navigation.addListener('focus', () => {
    //   console.log('route', route);
    //   setInitData(route.params.notification);
    //   setNotificationData(route.params.notification);
    // });
    // return unsubscribe;
  }, []);

  useEffect(() => {
    if (callStatus === 'complete' || callStatus === 'hanged') {
      endCall();
    }
  }, [callStatus]);

  useEffect(() => {
    setInitData();
  }, [notificationData]);

  useEffect(() => {
    setupVideoSDKEngine();
  }, [token]);

  useEffect(() => {
    getVideoToken();
  }, [channelName]);

  const setInitData = async () => {
    console.log('notificationData', notificationData);
    if (notificationData) {
      await setChannelName(notificationData?.channelName);
    }
    KeepAwake.activate();
  };

  const getVideoToken = async () => {
    console.log('getVideoToken.channelName', channelName);
    console.log('getVideoToken.uid', uid);
    const videoTokenResponse = await videoTokenApi.getVideoToken(
      channelName,
      uid,
    );
    console.log('getVideoToken.videoTokenResponse', videoTokenResponse);
    await setToken(videoTokenResponse.data.token);
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
          // If new user
          if (peerIds.indexOf(Uid) === -1) {
            setPeerIds([...peerIds, Uid]);
          }
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setPeerIds(peerIds.filter((id) => id !== Uid));
          setRemoteUid(Uid);
          endCall();
        },
      });
      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
      setTimeout(async () => {
        await startVideoCall();
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  };

  const startVideoCall = async () => {
    if (isJoined) {
      return;
    }
    try {
      console.log('startVideoCall.1');
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      console.log('startVideoCall.2');
      let duserId = notificationData?.doctorData;
      if (typeof notificationData?.doctorData === 'string') {
        duserId = JSON.parse(notificationData?.doctorData);
      }
      let dataObj = {
        uid: uid,
        channelName: channelName,
        userId: duserId.userId,
        status: 'accepted',
      };
      const response = await notificationApi.updateVideoNotification(dataObj);
    } catch (e) {
      console.log(e);
    }
  };

  const endCall = async () => {
    //const duserId = JSON.parse(notificationData?.doctorData);
    let duserId = notificationData?.doctorData;
    if (typeof notificationData?.doctorData === 'string') {
      duserId = JSON.parse(notificationData?.doctorData);
    }
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

    await agoraEngineRef.current?.leaveChannel();

    if (notificationData?.isLoggedIn) {
      RootNavigation.navigate('AppointmentFeedback', {
        AppointmentId: notificationData.appointmentId,
      });
    } else {
      RootNavigation.navigate('Welcome');
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

  const muteVideo = async () => {
    if (isVideoMuted) {
      setIsVideoMuted(false);
      console.log('Enable video');
      agoraEngineRef.current?.enableVideo();
    } else {
      setIsVideoMuted(true);
      console.log('Disable video');
      agoraEngineRef.current?.disableVideo();
    }
  };

  const muteAudio = async () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      console.log('Enable audio');
      agoraEngineRef.current?.muteLocalAudioStream(false);
    } else {
      setIsAudioMuted(true);
      console.log('Disable audio');
      agoraEngineRef.current?.muteLocalAudioStream(true);
    }
  };

  const CallButtonCancel = ({
    btnPress = () => console.log('call button...'),
    bgColor = '#CF3D3D',
    width = 15,
    imgSrc = require('../assets/images/phone_receiver.png'),
    imgWidth = 35,
    isMuted = false,
    strokeColor,
    style = {},
  }) => {
    return (
      <TouchableOpacity onPress={btnPress}>
        <View style={[styles.call_button(width, bgColor), style]}>
          {isMuted ? <OverlayCover /> : null}
          {isMuted ? <DiagonalStroke strokeColor={strokeColor} /> : null}
          <AutoHeightImage width={imgWidth} source={imgSrc} />
        </View>
      </TouchableOpacity>
    );
  };

  const DiagonalStroke = ({strokeColor = '#CF3D3D'}) => (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: strokeColor,
        transform: [{rotate: '45deg'}],
      }}></View>
  );

  const OverlayCover = ({bgColor = '#00000031', borderRd = 5}) => {
    return (
      <View
        style={{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: bgColor,
          borderRadius: borderRd,
        }}></View>
    );
  };

  function showMessage(msg: string) {
    setMessage(msg);
  }

  return (
    <SafeAreaView style={styles.max}>
      <View style={styles.fullView}>
        {isJoined && <RtcSurfaceView canvas={{uid: 0}} style={styles.max1} />}
        {isVideoMuted ? (
            <OverlayCover bgColor="#888888" borderRd={0} />
          ) : null}
          {isVideoMuted ? (
            <Image
              style={{
                zIndex: 2,
                alignSelf: 'center',
                marginBottom: '95%',
                marginTop: 'auto',
              }}
              source={require('../assets/images/close_icon_trans.png')}
            />
          ) : null}
        <View style={styles.remoteContainer}>
          {peerIds?.[0] ? (
            <RtcSurfaceView canvas={{uid: peerIds[0]}} style={styles.remote} />
          ) : null}
          
        </View>
        <View style={styles.buttonHolder}>
          <CallButtonCancel
            btnPress={() => {
              muteVideo();
              console.log('Video button pressed');
            }}
            width={60}
            imgSrc={require('../assets/images/video.png')}
            imgWidth={33}
            bgColor={'#3D7BCF'}
            isMuted={isVideoMuted}
            strokeColor="#ECF1F5"
          />
          <CallButtonCancel
            btnPress={() => {
              muteAudio();
              console.log('Mike button pressed');
            }}
            width={60}
            imgSrc={require('../assets/images/mike.png')}
            imgWidth={16}
            bgColor={'#ECF1F5'}
            isMuted={isAudioMuted}
            strokeColor="#0D6BC8"
            style={{marginLeft: 20}}
          />
          <CallButtonCancel
            btnPress={() => endCall()}
            width={60}
            imgSrc={require('../assets/images/phone_receiver.png')}
            imgWidth={38}
            strokeColor=""
            style={{marginLeft: 20}}
          />
        </View>
      </View>

      {/* <Text style={styles.head}>Agora Video Calling Quickstart</Text>
      <View style={styles.btnContainer}>
        <Text onPress={startVideoCall} style={styles.button}>
          Join
        </Text>
        <Text onPress={endCall} style={styles.button}>
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
      </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  call_button: (width: any, bgColor: any) => ({
    width,
    aspectRatio: 1,
    backgroundColor: bgColor,
    borderRadius: 5,
    ...AppStyles.centerXY,
  }),

  hangBtn: {
    position: 'absolute',
    left: '43%',
    bottom: 50,
    backgroundColor: 'transparent',
  },

  max: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    zIndex: 10,
  },
  buttonHolder: {
    height: 100,
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 20,
    zIndex: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height,
    justifyContent: 'center',
    alignContent: 'center',
  },
  max1: {
    width: '100%',
    height: '100%',
  },
  remoteContainer: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },

  remote: {
    width: 150,
    height: 150,
    marginHorizontal: 2.5,
    zIndex: 20,
  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
});

// const styles = StyleSheet.create({
//   button: {
//     paddingHorizontal: 25,
//     paddingVertical: 4,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     backgroundColor: '#0055cc',
//     margin: 5,
//   },
//   main: {flex: 1, alignItems: 'center'},
//   scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
//   scrollContainer: {alignItems: 'center'},
//   videoView: {width: '90%', height: 200},
//   btnContainer: {flexDirection: 'row', justifyContent: 'center'},
//   head: {fontSize: 20},
//   info: {backgroundColor: '#ffffe0', color: '#0000ff'},
// });
