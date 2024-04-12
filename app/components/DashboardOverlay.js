import React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, Image} from 'react-native';
import {
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppStyles from '../config/style';

export default function DashboardOverlay({
  backgroundColor = AppStyles.colors.grey_overlay,
  isVisible = false,
  overlayPress,
  style = {},
}) {
  overlayPress =
    overlayPress ||
    (() => {
      console.log('No handler provided...');
    });

  return !isVisible ? (
    <></>
  ) : (
    <TouchableHighlight
      underlayColor={backgroundColor}
      style={{...styles.touchHighlight, ...style, backgroundColor}}
      onPress={overlayPress}>
      <View style={styles.overlay_inner}>
        <View style={styles.row_1}>
          <View style={styles.row_1_col}>
            <View
              style={[styles.button_placeholer, {left: responsiveWidth(8.75)}]}>
              <Image
                style={{width: '43%', resizeMode: 'contain'}}
                source={require('../assets/images/icon_sidemenu.png')}
              />
            </View>
            <Image
              style={{width: '43%', resizeMode: 'contain'}}
              source={require('../assets/images/arrow-90deg-left.png')}
            />
            <View style={styles.text_wrapper}>
              <Text style={styles.guide_text}>
                Health Forum shared by experts
              </Text>
            </View>
          </View>

          <View style={[styles.row_1_col, {justifyContent: 'center'}]}>
            <View
              style={[
                styles.button_placeholer,
                {right: responsiveWidth(8.75)},
              ]}>
              <Image
                style={{width: '63%', resizeMode: 'contain'}}
                source={require('../assets/images/icon_notify.png')}
              />
            </View>
            <Image
              style={{width: '43%', resizeMode: 'contain'}}
              source={require('../assets/images/arrow-90deg-right.png')}
            />
            <View style={styles.text_wrapper}>
              <Text style={styles.guide_text}>Notification</Text>
            </View>
          </View>
        </View>

        <View style={styles.row_2}>
          <Image
            style={styles.image_avatar}
            source={require('../assets/images/img_avatar01.png')}
          />
        </View>

        <View style={styles.row_3}>
          <Text style={styles.guide_text_bottom}>
            Find Doctors and Book Appointments
          </Text>
          <Image
            style={{marginLeft: 80, marginTop: 10, resizeMode: 'contain'}}
            source={require('../assets/images/arrow-90deg-right-bottom.png')}
          />
          {/* </View> */}
          <View style={styles.search_placeholder}>
            {/* <Image
              style={styles.search_image}
              source={require('../assets/images/icon_search.png')}
            /> */}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

var styles = StyleSheet.create({
  touchHighlight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  overlay_inner: {
    flex: 1,
  },
  row_1: {
    flexDirection: 'row',
    flexBasis: '32%',
  },
  row_1_col: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button_placeholer: {
    width: 35,
    height: 35,
    backgroundColor: AppStyles.colors.white,
    borderRadius: 7,
    borderColor: AppStyles.colors.blue,
    borderWidth: 2,
    ...AppStyles.centerXY,
    position: 'absolute',
    top: 10,
  },
  text_wrapper: {
    width: responsiveWidth(35),
  },
  guide_text: {
    fontSize: responsiveFontSize(3.0),
    lineHeight: responsiveFontSize(3.4),
    color: AppStyles.colors.white,
    textAlign: 'center',
  },
  row_2: {
    flexBasis: '38%',
    marginBottom: 50,
  },
  image_avatar: {
    flex: 1,
    width: undefined,
    height: undefined,
    resizeMode: 'contain',
  },
  row_3: {
    flexBasis: '34%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  guide_text_bottom: {
    width: '60%',
    fontSize: responsiveFontSize(3.0),
    lineHeight: responsiveFontSize(3.4),
    color: AppStyles.colors.white,
    textAlign: 'center',
  },
  search_placeholder: {
    width: responsiveWidth(100) * 0.18,
    height: responsiveWidth(100) * 0.18,
    ...AppStyles.centerXY,
    // backgroundColor: AppStyles.colors.oliveGreen,
    // borderColor: '#EEF3F5',
    // borderWidth: 2,
    // borderRadius: 50,
    padding: 15,
    marginBottom: 45,
  },
  search_image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
