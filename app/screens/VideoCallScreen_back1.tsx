import React, {Component, useRef, useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Dimensions,
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
  VideoViewSetupMode,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './requestPermission';
import notificationApi from '../api/notification';
import authStorage from '../auth/storage';
import videoTokenApi from '../api/videoToken';
import * as RootNavigation from '../navigation/rootNavigation';
import CallContext from '../auth/callContext';

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
const channelName = '60b7a3081af58e56ab4733a160b87b828b59d46d3f6463aa';
const token =
  '006d5da55e6badc47a1b9aeae4077b789a0IACV2fFxc4nRHJdMpqefSq2oUelMj/mwPIQYypVVv1E/oEnrI83pr4RpIgDL5gmxzJCqYwQAAQCMva5jAgCMva5jAwCMva5jBACMva5j';
const uid = 90;

interface Props {
  route: any;
  notification: any;
  //navigation: any
}

/**
 * @property peerIds Array for storing connected peers
 * @property appId
 * @property channelName Channel Name for the current session
 * @property joinSucceed State variable for storing success
 */
interface State {
  appId: string;
  token: string;
  channelName: string;
  joinSucceed: boolean;
  peerIds: number[];
  user: any;
  uid: number;
  notificationData: any;
  isVideoMuted: boolean;
  isAudioMuted: boolean;
}

export default class VideoCallScreen extends Component<Props, State> {
  _engine?: IRtcEngine;
  currentCallId: Number | undefined;
  static contextType = CallContext;

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      appId: config.agoraAppId,
      token: '',
      channelName: '',
      joinSucceed: false,
      peerIds: [],
      user: {},
      uid: Math.floor(Math.random() * 100),
      notificationData: {},
      isVideoMuted: false,
      isAudioMuted: false,
      setupMode: VideoViewSetupMode.VideoViewSetupReplace,
    };
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }

  async componentDidMount() {
    //const {notification} = this.props;

    let notification = {
      appointmentId: '624a9c10ee399891d68d86f0',
      channelName: '60b7a3081af58e56ab4733a160b87b828b59d46d3f6463aa',
      doctorData: '6242985d6c0981e51899113b',
      duuid: '60b87b828b59d46d3f6463aa',
      isLoggedIn: true,
      priority: 'high',
      type: 'call',
      uuid: '60b7a3081af58e56ab4733a1',
    };
    console.log('componentDidMount.notification', notification);
    this.setState(
      {channelName: notification?.channelName, notificationData: notification},
      async () => {
        const callStatus = this.context;
        console.log('componentDidMount.callStatus', callStatus);
        await this.getVideoToken();
        if (callStatus === 'hanged') {
          this.endCall();
        }
      },
    );

    KeepAwake.activate();
    this.getUser();
  }

  getUser = async () => {
    const user = await authStorage.getUser();
    if (user) this.setState({user});
  };

  async componentDidUpdate() {
    const callStatus = this.context;
    if (callStatus === 'complete') {
      this.endCall();
    } else if (callStatus === 'hanged') {
      this.endCall();
    }
  }

  getVideoToken = async () => {
    const {channelName, uid} = this.state;
    console.log('getVideoToken.channelName', channelName);
    console.log('getVideoToken.uid', uid);
    const videoTokenResponse = await videoTokenApi.getVideoToken(
      channelName,
      uid,
    );
    console.log('getVideoToken.videoTokenResponse', videoTokenResponse.data);
    this.setState({token: videoTokenResponse.data.token}, async () => {
      await this.setupVideoSDKEngine();
    });
  };

  componentWillUnmount() {
    this.endCall();
  }

  setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await this.getPermission();
      }
      this._engine = await createAgoraRtcEngine();
      const agoraEngine = this._engine;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (channel, uid, elapsed) => {
          //showMessage('Successfully joined the channel ' + channelName);
          console.log('JoinChannelSuccess', channel, uid, elapsed);
          this.setState({joinSucceed: true});
        },
        onUserJoined: (_connection, Uid) => {
          //showMessage('Remote user joined with uid ' + Uid);
          //setRemoteUid(Uid);
          console.log('UserJoined', uid);
          // Get current peer IDs
          const {peerIds} = this.state;
          // If new user
          if (peerIds.indexOf(uid) === -1) {
            this.setState({
              // Add peer ID to state array
              peerIds: [...peerIds, uid],
            });
          }
        },
        onUserOffline: (_connection, Uid) => {
          // showMessage('Remote user left the channel. uid: ' + Uid);
          // setRemoteUid(0);
          console.log('UserOffline', uid);
          const {peerIds} = this.state;
          this.setState({
            // Remove peer ID from state array
            peerIds: peerIds.filter((id) => id !== uid),
          });
          this.endCall();
        },
      });
      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      await agoraEngine.enableVideo();
      await this.startVideoCall(agoraEngine);
    } catch (e) {
      console.log(e);
    }
  };

  startVideoCall = async (agoraEngine) => {
    // if (joinSucceed) {
    //   return;
    // }
    try {
      const {token, uid, channelName, notificationData} = this.state;
      //const duserId = JSON.parse(notificationData?.doctorData);
      const duserId = notificationData?.doctorData;
      console.log('startVideoCall.duserId', duserId);
      console.log('startVideoCall.token', token);
      console.log('startVideoCall.uid', uid);
      console.log('startVideoCall.channelName', channelName);
      console.log('startVideoCall.notificationData', notificationData);

      agoraEngine.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngine.startPreview();
      agoraEngine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      // Join Channel using null token and channel name
      // await this._engine?.joinChannel(token, channelName, null, uid);
      let dataObj = {
        uid: uid,
        channelName: channelName,
        //userId: duserId.userId,
        userId: duserId,
        status: 'accepted',
      };
      const response = await notificationApi.updateVideoNotification(dataObj);
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * @name endCall
   * @description Function to end the call
   */
  endCall = async () => {
    const {uid, channelName, notificationData, user} = this.state;
    //const duserId = JSON.parse(notificationData?.doctorData);
    const duserId = notificationData?.doctorData;
    const response = await notificationApi.updateVideoNotification({
      uid: uid,
      channelName: channelName,
      //userId: duserId?.userId,
      userId: duserId,
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

    // if (notificationData?.isLoggedIn) {
    //   RootNavigation.navigate('AppointmentFeedback', {
    //     AppointmentId: notificationData.appointmentId,
    //   });
    // } else {
    //   RootNavigation.navigate('Welcome');
    // }
  };

  muteVideo = async () => {
    const {isVideoMuted} = this.state;
    if (isVideoMuted) {
      this.setState({isVideoMuted: false});
      console.log('Enable video');
      this._engine?.enableVideo();
    } else {
      this.setState({isVideoMuted: true});
      console.log('Disable video');
      this._engine?.disableVideo();
    }
  };

  muteAudio = async () => {
    const {isAudioMuted, isVideoMuted} = this.state;
    if (isAudioMuted) {
      this.setState({isAudioMuted: false});
      console.log('Enable audio');
      this._engine?.muteLocalAudioStream(false);
    } else {
      this.setState({isAudioMuted: true});
      console.log('Disable audio');
      this._engine?.muteLocalAudioStream(true);
    }
  };

  muteVolume = async () => {
    console.log('muteVolume called');
  };

  // const leave = () => {
  //   try {
  //     agoraEngineRef.current?.leaveChannel();
  //     setRemoteUid(0);
  //     setIsJoined(false);
  //     showMessage('You left the channel');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  resetStates() {
    setError('');
  }

  showMessage(msg: string) {
    //setMessage(msg);
  }

  getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  render() {
    const {peerIds, isVideoMuted, isAudioMuted, joinSucceed} = this.state;

    return (
      <SafeAreaView style={styles.main}>
        <Text style={styles.head}>Agora Video Calling Quickstart</Text>
        <View style={styles.btnContainer}>
          <Text onPress={this.startVideoCall} style={styles.button}>
            Join
          </Text>
          <Text onPress={this.endCall} style={styles.button}>
            Leave
          </Text>
          <Text>Local user uid: {uid}</Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContainer}>
          {joinSucceed ? (
            <React.Fragment key={uid}>
              <RtcSurfaceView canvas={{uid: uid}} style={styles.videoView} />
              <Text>Local user uid: {uid}</Text>
            </React.Fragment>
          ) : (
            <Text>Join a channel</Text>
          )}
          {joinSucceed && peerIds.length > 1 ? (
            <React.Fragment key={peerIds[0]}>
              <RtcSurfaceView
                canvas={{uid: peerIds[0]}}
                style={styles.videoView}
              />
              <Text>Remote user uid: {peerIds[0]}</Text>
            </React.Fragment>
          ) : (
            <Text>Waiting for a remote user to join</Text>
          )}
          {/* <Text style={styles.info}>{message}</Text> */}
        </ScrollView>
      </SafeAreaView>
    );
  }
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

export default VideoCallScreen;
