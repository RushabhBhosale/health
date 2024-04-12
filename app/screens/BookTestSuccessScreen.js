import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import ScreenScrollable from '../components/ScreenScrollable';
import AppStyles, {
  GetTextStyle,
  Container_Width,
  IsAndroid,
} from '../config/style';
import {Day_dd_Mon} from '../config/functions';

const WIDTH = Container_Width;

export default function BookTestSuccessScreen({navigation, route}) {
  const [bookData, set_bookData] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      route.params?.BookData
        ? set_bookData(JSON.parse(route.params.BookData))
        : navigation.goBack();
    });
    return unsubscribe;
  }, [route, route.params]);

  const {fullName, gender, slotDate, slotLabel} = bookData;

  return (
    <View style={styles.mainContainer}>
      <ScreenScrollable>
        <View style={styles.content}>
          <View style={styles.icon_wrapper}>
            <AutoHeightImage
              width={responsiveWidth(100) * 0.2}
              source={require('../assets/images/congrats_tick.png')}
            />
          </View>

          <View style={styles.avatar_wrapper}>
            <AutoHeightImage
              width={responsiveWidth(100) * 0.85}
              source={require('../assets/images/img_avatar01.png')}
            />
          </View>

          <Text style={styles.heading}>Test Booked Successfully</Text>

          <Text style={styles.para}>
            Appointment of {gender === 'Male' ? 'Mr.' : 'Ms.'} {fullName} has
            been booked for
          </Text>

          <Text style={styles.para_2}>
            {slotLabel} {Day_dd_Mon(new Date(slotDate))}
          </Text>
        </View>
      </ScreenScrollable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: IsAndroid ? 50 : 80,
    marginBottom: 0,
  },
  icon_wrapper: {
    marginBottom: 20,
  },
  avatar_wrapper: {
    marginBottom: 30,
  },
  heading: {
    ...GetTextStyle(undefined, 3.2, 'bold', 'center'),
    marginBottom: 15,
  },
  para: {
    ...GetTextStyle(undefined, 2.2, undefined, 'center'),
    marginBottom: 5,
  },
  para_2: {
    ...GetTextStyle(undefined, 2.4, 'bold', 'center'),
    marginBottom: 30,
  },
});
