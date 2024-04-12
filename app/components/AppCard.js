import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppStyles, {IsAndroid} from '../config/style';
import {getFullUrl} from '../config/functions';

export default function AppCard({data: {_id, image, title, subtitle}}) {
  return (
    <View style={styles.wrapper}>
      <NeomorphFlex inner={IsAndroid} style={styles.neoFlex}>
        <View style={styles.card}>
          <Image
            style={styles.cdImage}
            source={{uri: getFullUrl(image, 'slides/' + _id + '/')}}></Image>
          <Text style={styles.cdTitle}>{title}</Text>
          <Text style={styles.cdSubTitle}>{subtitle}</Text>
        </View>
      </NeomorphFlex>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: responsiveWidth(100),
  },
  neoFlex: {
    shadowRadius: 3,
    borderRadius: 15,
    backgroundColor: AppStyles.colors.lightgrey,
    width: responsiveWidth(80),
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  cdImage: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
    resizeMode: 'contain',
  },
  cdTitle: {
    maxWidth: responsiveWidth(50),
    textAlign: 'center',
    fontSize: responsiveFontSize(2.4),
    fontWeight: 'bold',
    color: AppStyles.colors.primary,
  },
  cdSubTitle: {
    maxWidth: responsiveWidth(60),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
    color: AppStyles.colors.primary,
  },
});
