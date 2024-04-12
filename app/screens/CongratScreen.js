import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import ScreenScrollable from '../components/ScreenScrollable';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppStyles, {GetTextStyle, IsAndroid} from '../config/style';
import useAuth from '../auth/useAuth';

export default function CongratScreen({route}) {
  const auth = useAuth();
  const [routeUser, set_routeUser] = useState({});

  useEffect(() => {
    if (route.params?.userData) set_routeUser(route.params?.userData);
  }, [route, route.params]);

  const handleSubmit = async () => {
    await auth.profile(routeUser);
  };

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
              width={responsiveWidth(100) * 0.8}
              source={require('../assets/images/img_avatar01.png')}
            />
          </View>

          <Text style={styles.heading}>Congratulations</Text>

          <Text style={styles.para}>
            your account is successfully created. Find your doctor now!
          </Text>

          <AppButtonPrimary
            width={responsiveWidth(100) * 0.73}
            aspect_ratio={0.18}
            shadowRadius={3}
            btTitle={'LOGIN TO MY DASHBOARD'}
            btPress={() => handleSubmit()}
            textSize={responsiveFontSize(2.2)}
            gradientBorderWidth={3}
          />
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
    alignItems: 'center',
    marginTop: IsAndroid ? 30 : 80,
    marginBottom: 30,
  },
  icon_wrapper: {
    marginBottom: 10,
  },
  avatar_wrapper: {
    borderBottomColor: AppStyles.colors.grey03,
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  heading: {
    ...GetTextStyle(undefined, 3.2, 'bold', 'center'),
    lineHeight: 30,
    width: '60%',
    marginBottom: 15,
  },
  para: {
    ...GetTextStyle(undefined, 2.4, 'bold', 'center'),
    lineHeight: 25,
    width: '65%',
    marginBottom: 30,
  },
});
