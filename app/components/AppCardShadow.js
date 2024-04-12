import React, {useRef, useEffect} from 'react';
import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {Neomorph} from 'react-native-neomorph-shadows';
import AutoHeightImage from 'react-native-auto-height-image';
import AppBoxShadow from './AppBoxShadow';
import AppHeading from './AppHeading';
import AppPara from './AppPara';
import AppStyles, {IsAndroid} from '../config/style';
import {getFullUrl} from '../config/functions';

export default function AppCardShadow({
  height = responsiveWidth(100) * 0.21,
  is_Selected = false,
  c_id = null,
  c_title = 'Card Title',
  c_subtitle = 'Card para of text goes here',
  c_thumbnail = require('../assets/images/sp_physician.png'),
  c_thumbnail_active = require('../assets/images/sp_physician.png'),
  action_function = () => console.log('card pressed...'),
  c_append_icon = require('../assets/images/icon_checked.png'),
  ...restCardProps
}) {
  let color_title = is_Selected ? '#3D7BCF' : '#777777';
  let color_subtitle = is_Selected ? '#888888' : '#AAAAAA';

  /* const thumb_ref = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      console.log('thumb wrap current: ', thumb_ref.current.clientHeight);
    }, 1000);
  }, []); */

  return (
    <AppBoxShadow {...restCardProps} height={height}>
      <View style={styles.row}>
        <View style={styles.c_thumb_wrap}>
          {is_Selected ? (
            <AutoHeightImage
              width={responsiveWidth(100) * 0.1}
              source={{
                uri: getFullUrl(
                  c_thumbnail_active,
                  'specialists/' + c_id + '/',
                ),
              }}
            />
          ) : (
            <AutoHeightImage
              width={responsiveWidth(100) * 0.1}
              source={{
                uri: getFullUrl(c_thumbnail, 'specialists/' + c_id + '/'),
              }}
            />
          )}
        </View>

        <View style={styles.c_content_wrap}>
          <AppHeading style={styles.c_title(color_title, 2.1)}>
            {c_title}
          </AppHeading>
          <AppPara style={styles.c_subtitle(color_subtitle, 1.7)}>
            {c_subtitle}
          </AppPara>
        </View>

        <View style={styles.c_append_wrap}>
          <TouchableOpacity onPress={() => action_function(c_id)}>
            <Neomorph inner={IsAndroid} style={styles.c_append_shadow_wrap}>
              <View style={styles.c_append_icon_wrap}>
                {is_Selected && (
                  <Image style={styles.c_append_icon} source={c_append_icon} />
                )}
              </View>
            </Neomorph>
          </TouchableOpacity>
        </View>
      </View>
    </AppBoxShadow>
  );
}

const getTextStyle = (color, fontSize) => ({
  fontSize: responsiveFontSize(fontSize),
  color,
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  c_thumb_wrap: {
    flexBasis: '15%',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  c_thumb: {
    flexBasis: '100%',
    aspectRatio: 1 / 1,
    resizeMode: 'contain',
  },
  c_content_wrap: {
    flexBasis: '75%',
    paddingHorizontal: 10,
  },
  c_title: (color, fontSize) => ({
    ...getTextStyle(color, fontSize),
    marginBottom: 3,
    textAlign: 'left',
  }),
  c_subtitle: (color, fontSize) => ({
    ...getTextStyle(color, fontSize),
  }),
  c_append_wrap: {
    flexBasis: '10%',
    alignItems: 'flex-end',
  },
  c_append_shadow_wrap: {
    shadowRadius: 2,
    borderRadius: 25,
    width: responsiveWidth(100) * 0.09,
    height: responsiveWidth(100) * 0.09,
    backgroundColor: AppStyles.colors.lightgrey,
    ...AppStyles.centerXY,
  },
  c_append_icon_wrap: {
    flex: 1,
    ...AppStyles.centerXY,
  },
  c_append_icon: {
    width: responsiveWidth(100) * 0.08,
    height: responsiveWidth(100) * 0.08,
    resizeMode: 'contain',
  },
});
