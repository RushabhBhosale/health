import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AppButtonIcon from './AppButtonIcon';
import AppStyles from '../config/style';

const RATED = require('../assets/images/icon_star_golden.png');
const UNRATED = require('../assets/images/icon_star.png');

export default function AppRatings({totalRatings = 5, rating, set_rating}) {
  return (
    <View style={styles.rating_wrap}>
      {Array.from({length: totalRatings}).map((item, index) => {
        return (
          <AppButtonIcon
            key={'rate-star-' + index}
            borderRadius={30}
            style={{marginHorizontal: 5}}
            btPress={() => set_rating(index + 1)}>
            <Image
              style={{width: '65%', resizeMode: 'contain'}}
              source={index + 1 <= rating ? RATED : UNRATED}
            />
          </AppButtonIcon>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rating_wrap: {
    flexDirection: 'row',
    ...AppStyles.centerXY,
  },
});
