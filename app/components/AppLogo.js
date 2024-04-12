import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

export default function AppLogo({width = '100%'}) {
  return (
    <View>
      <Image
        style={[styles.logo, {width: width}]}
        source={require('../assets/logo.png')}></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    flex: 1,
    alignSelf: 'center',
    height: undefined,
    resizeMode: 'contain',
  },
});
