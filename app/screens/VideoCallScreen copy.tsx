import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './requestPermission';
import notificationApi from '../api/notification';
import authStorage from '../auth/storage';
import videoTokenApi from '../api/videoToken';
// import RNCallKeep from 'react-native-callkeep';

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

interface Props {
  route: any;
  notification: any
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
  _engine?: RtcEngine;
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
      isAudioMuted: false
    };
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }

  }

  async componentDidMount() {
    const {notification} = this.props;

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
    if (user) this.setState({ user });
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
    this.setState({token: videoTokenResponse.data.token}, 
        async () => {
            await this.init();
            await this.startVideoCall();
          },
    );
  };

  componentWillUnmount() {
    this.endCall();
  }

  /**
   * @name init
   * @description Function to initialize the Rtc Engine, attach event listeners and actions
   */
  init = async () => {
    const {appId} = this.state;
    this._engine = await RtcEngine.create(appId);
    this._engine.enableEncryption(true, {
      encryptionMode: 1,
      encryptionKey: config.agoraEncryptionKey
    });
    await this._engine.enableVideo();

    this._engine.addListener('Warning', (warn) => {
      //console.log('Warning', warn);
    });

    this._engine.addListener('Error', (err) => {
      console.error('Error', err);
    });

    this._engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      // Get current peer IDs
      const {peerIds} = this.state;
      // If new user
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          // Add peer ID to state array
          peerIds: [...peerIds, uid],
        });
      }
    });

    this._engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      const {peerIds} = this.state;
      this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter((id) => id !== uid),
      });
      this.endCall();
    });

    // If Local user joins RTC channel
    this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      // Set state variable to true
      this.setState({
        joinSucceed: true,
      });
    });
  };

  /**
   * @name startCall
   * @description Function to start the call
   */
  startVideoCall = async () => {
    const {token, uid, channelName, notificationData} = this.state;
    const duserId = JSON.parse(notificationData?.doctorData);
    console.log('startVideoCall.duserId', duserId);
    console.log('startVideoCall.token', token);
    console.log('startVideoCall.uid', uid);
    console.log('startVideoCall.channelName', channelName);
    console.log('startVideoCall.notificationData', notificationData);

    // Join Channel using null token and channel name
    await this._engine?.joinChannel(token, channelName, null, uid);
    let dataObj = {
      uid: uid,
      channelName: channelName,
      userId: duserId.userId,
      status: 'accepted',
    };
    const response = await notificationApi.updateVideoNotification(dataObj);
  };

  /**
   * @name endCall
   * @description Function to end the call
   */
  endCall = async () => {
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

    if(notificationData?.isLoggedIn) {
      RootNavigation.navigate('AppointmentFeedback', {
        AppointmentId: notificationData.appointmentId,
      });
    } else {
      RootNavigation.navigate('Welcome');
    }

    
  };

  muteVideo = async () => {
    const { isVideoMuted } = this.state;
    if (isVideoMuted) {
      this.setState({ isVideoMuted: false });
      console.log("Enable video");
      this._engine?.enableVideo();
    } else {
      this.setState({ isVideoMuted: true });
      console.log("Disable video");
      this._engine?.disableVideo();
    }
  };

  muteAudio = async () => {
    const { isAudioMuted, isVideoMuted } = this.state;
    if (isAudioMuted) {
      this.setState({ isAudioMuted: false });
      console.log("Enable audio");
      this._engine?.muteLocalAudioStream(false);
    } else {
      this.setState({ isAudioMuted: true });
      console.log("Disable audio");
      this._engine?.muteLocalAudioStream(true);
    }
  }
  
  muteVolume = async () => {
    console.log("muteVolume called");
  }

  render() {
        return (
            <View style={styles.max}>
                {this._renderVideos()}
            </View>
        )
    }

    _renderVideos = () => {
        const {joinSucceed} = this.state
        return joinSucceed ? (
            <>
            <View>
                {this._renderRemoteVideos()}
            </View>
            </>
        ) : null
    }

    _renderRemoteVideos = () => {
        const {peerIds, isVideoMuted, isAudioMuted} = this.state
        return (
            <View
                style={styles.fullView} >
                {peerIds.map((value, index, array) => {
                    return (
                        <RtcRemoteView.SurfaceView
                            style={styles.max1}
                            uid={value}
                            key={value+index}
                            channelId={this.state.channelName}
                            renderMode={VideoRenderMode.Hidden}
                            zOrderMediaOverlay={false}/>
                    )
                })}
                <View style={styles.remoteContainer}>
                    <RtcLocalView.SurfaceView
                        style={styles.remote}
                        channelId={this.state.channelName}
                        renderMode={VideoRenderMode.Hidden}
                        zOrderMediaOverlay={true}
                        />
                        {isVideoMuted ? <OverlayCover bgColor="#888888" borderRd={0} /> : null}
                        {isVideoMuted ? (
                          <Image
                            style={{
                              zIndex: 2,
                              alignSelf: 'center',
                              marginBottom: '35%',
                              marginTop: 'auto',
                            }}
                            source={require('../assets/images/close_icon_trans.png')}
                          />
                        ) : null}
                    </View>
                <View style={styles.buttonHolder}>
                        <CallButtonCancel
                            btnPress={() => { this.muteVideo(); console.log('Video button pressed') }}
                            width={60}
                            imgSrc={require('../assets/images/video.png')}
                            imgWidth={33}
                            bgColor={'#3D7BCF'}
                            isMuted={isVideoMuted}
                            strokeColor="#ECF1F5"
                        />
                        <CallButtonCancel
                            btnPress={() => { this.muteAudio(); console.log('Mike button pressed') }}
                            width={60}
                            imgSrc={require('../assets/images/mike.png')}
                            imgWidth={16}
                            bgColor={'#ECF1F5'}
                            isMuted={isAudioMuted}
                            strokeColor="#0D6BC8"
                            style={{marginLeft: 20}}
                        />
                        {/* <CallButtonCancel
                            btnPress={() => { this.muteVolume(); console.log('Speaker button pressed')}}
                            width={60}
                            imgSrc={require('../assets/images/speaker.png')}
                            imgWidth={16}
                            bgColor={'#ECF1F5'}
                            style={{marginLeft: 20}}
                        /> */}
                        <CallButtonCancel
                            btnPress={() => this.endCall()}
                            width={60}
                            imgSrc={require('../assets/images/phone_receiver.png')}
                            imgWidth={38}
                            strokeColor=""
                            style={{marginLeft: 20}}
                        />
                    </View>
            </View>
        )
    }
}

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
    },
    buttonHolder: {
        height: 100,
        alignSelf: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        position: 'absolute',
        bottom: 20,
        zIndex: 10
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
        zIndex: 20
    },

    remote: {
        width: 150,
        height: 150,
        marginHorizontal: 2.5,
        zIndex: 20
    },
    noUserText: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: '#0093E9',
    },
});


