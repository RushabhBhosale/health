import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ShadowFlex} from 'react-native-neomorph-shadows';
import AppStyles, {IsAndroid, Container_Width} from '../config/style';

const BORDER_RADIUS = 8;

export default function AppProgressBar({
  width = Container_Width,
  progress = '45%',
  style = {},
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.progress_text}>{`${progress} %`}</Text>
      <ShadowFlex
        inner={IsAndroid}
        style={{
          width,
          height: 14,
          borderRadius: BORDER_RADIUS,
          shadowRadius: 4,
          shadowColor: AppStyles.colors.progress_shadow,
          backgroundColor: AppStyles.colors.lightgrey,
          ...style,
        }}>
        {progress ? (
          <View style={{...styles.progress, right: 100 - progress + '%'}}>
            <View style={styles.progress_inner} />
          </View>
        ) : (
          <View></View>
        )}
      </ShadowFlex>
    </View>
  );
}

var styles = StyleSheet.create({
  wrapper: {width: '100%', alignItems: 'center'},
  progress_text: {
    color: AppStyles.colors.blue02,
    marginBottom: 10,
  },
  progress: {
    position: 'absolute',
    top: -7,
    left: -7,
    right: -7,
    bottom: -7,
    padding: 5,
    borderWidth: 4,
    borderColor: AppStyles.colors.grey02,
    borderRadius: BORDER_RADIUS,
  },
  progress_inner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 5,
    backgroundColor: '#D19C2C',
    borderWidth: 2,
    borderColor: AppStyles.colors.lightgrey,
    borderRadius: BORDER_RADIUS,
  },
});
