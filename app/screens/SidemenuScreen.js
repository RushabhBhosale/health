import React, {useEffect, useState, useContext} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import ScreenScrollable from '../components/ScreenScrollable';
import AppBoxShadow from '../components/AppBoxShadow';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonPrimary from '../components/AppButtonPrimary';
import {DividerX, ThumbPlaceholder} from '../components/AppCommonComponents';
import AppStyles, {Container_Width} from '../config/style';
import useAuth from '../auth/useAuth';
import appContext from '../auth/appContext';
import AuthContext from '../auth/context';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RNLocation from 'react-native-location';
// import Geocoder from 'react-native-geocoding';
import {ToComePopup} from '../utility/alert-boxes';
import AllowIfOnline from '../utility/allow-if-online';
import {makeFullName, getFullUrl} from '../config/functions';
import { useTranslation } from 'react-i18next';

// Initialize the module (needs to be done only once)
// Geocoder.init(settings.mapsApiKey); // use a valid API key

//import Geolocation from 'react-native-geolocation-service';

const WIDTH = Container_Width;
const THUMB_BORDER_RADIUS = 18;

export default function SidemenuScreen({navigation}) {
  const {t, i18n} = useTranslation();
  const {AppOffline} = useContext(appContext);
  const {user, setUser} = useContext(AuthContext);
  const [userLocation, setUserLocation] = useState(null);

  const auth = useAuth();

  const logout = async () => {
    await auth.logOut();
  };

  useEffect(() => {
    // getLocation();
  }, []);

  const getLocation = async () => {
    RNLocation.configure({
      distanceFilter: 100, // Meters
      desiredAccuracy: {
        ios: 'best',
        android: 'balancedPowerAccuracy',
      },
      // Android only
      androidProvider: 'auto',
      interval: 5000, // Milliseconds
      fastestInterval: 10000, // Milliseconds
      maxWaitTime: 5000, // Milliseconds
      // iOS Only
      activityType: 'other',
      allowsBackgroundLocationUpdates: false,
      headingFilter: 1, // Degrees
      headingOrientation: 'portrait',
      pausesLocationUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: false,
    });

    const permission = await RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'coarse',
      },
    });

    if (permission) {
      const latestLocation = await RNLocation.getLatestLocation({
        timeout: 60000,
      });

      // Geocoder.from(latestLocation.latitude, latestLocation.longitude)
      //   .then((json) => {
      //     var addressComponent = json.results[0].address_components[0];
      //   })
      //   .catch((error) => console.warn(error));
    }
  };

  const profile_image = getFullUrl(user?.avtar, 'patients/' + user?._id + '/');

  return (
    <ScreenScrollable style={styles.mainContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppBoxShadow
            width={responsiveWidth(24)}
            height={responsiveWidth(24)}
            borderRadius={THUMB_BORDER_RADIUS}
            style={{marginBottom: 10}}>
            {profile_image ? (
              <Image
                style={styles.profile_thumb}
                source={{uri: profile_image}}
              />
            ) : (
              <ThumbPlaceholder
                fName={user?.firstName}
                lName={user?.lastName}
              />
            )}
          </AppBoxShadow>
          <AppHeading style={styles.profile_title}>
            {makeFullName(user?.firstName, user?.lastName)}
          </AppHeading>
          <AppPara style={styles.profile_subtitle}>Mumbai</AppPara>
          <AppButtonPrimary
            width={WIDTH}
            height={55}
            shadowRadius={2}
            btPress={ToComePopup}>
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
              }}>
              <AppBoxShadow
                width={responsiveWidth(7)}
                height={responsiveWidth(7)}
                borderRadius={25}
                shadowRadius={2}
                shadow01Color={AppStyles.colors.blue}
                style={{marginHorizontal: 15}}
                content_style={AppStyles.centerXY}>
                <Image
                  style={{width: '55%', resizeMode: 'contain'}}
                  source={require('../assets/images/menu_ambulance.png')}
                />
              </AppBoxShadow>
              <Text style={styles.profile_btn_txt}>{t("book_ambulance")}</Text>
            </View>
          </AppButtonPrimary>
        </View>

        <View> 
          <DividerX style={{marginBottom: 30}} />
          <MenuItem
            iconImage={require('../assets/images/menu_contact_us.png')}
            menuText={t("more_find_fmc")}
            onPress={() =>
              AllowIfOnline(AppOffline, () => navigation.navigate('Find_FMCs'))
            }
          />
          <MenuItem
            iconImage={require('../assets/images/menu_information.png')}
            menuText={t("about_app")}
            onPress={() =>
              AllowIfOnline(AppOffline, () => navigation.navigate('About'))
            }
          />
          <MenuItem
            iconImage={require('../assets/images/menu_settings.png')}
            menuText={t("more_settings")}
            onPress={() =>
              AllowIfOnline(AppOffline, () =>
                navigation.navigate('ProfileDetail', {
                  showTabActive: 3,
                }),
              )
            }
          />
          <MenuItem
            iconImage={require('../assets/images/menu_contact_us.png')}
            menuText={t("more_contactus")}
            onPress={() =>
              AllowIfOnline(AppOffline, () => navigation.navigate('ContactUs'))
            }
          />
          <DividerX style={{marginBottom: 30}} />
          <MenuItem
            iconImage={require('../assets/images/menu_share.png')}
            menuText={t("share_app")}
            onPress={ToComePopup}
          />
          <MenuItem
            iconImage={require('../assets/images/menu_faq.png')}
            menuText={t("faqs_help")}
            onPress={() =>
              AllowIfOnline(AppOffline, () =>
                navigation.navigate('About', {
                  showTabActive: 2,
                }),
              )
            }
          />
          <DividerX style={{marginBottom: 30}} />
          <MenuItem
            iconImage={require('../assets/images/menu_logout.png')}
            menuText="Signout"
            onPress={logout}
          />
        </View>
      </View>
    </ScreenScrollable>
  );
}

const MenuItem = ({
  iconImage = require('../assets/images/menu_ambulance.png'),
  menuText = 'menu title',
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.menu_item}>
        <AppBoxShadow
          width={responsiveWidth(7)}
          height={responsiveWidth(7)}
          borderRadius={25}
          shadowRadius={2}
          style={styles.menu_icon}
          content_style={AppStyles.centerXY}>
          <Image
            style={{width: '55%', resizeMode: 'contain'}}
            source={iconImage}
          />
        </AppBoxShadow>
        <Text style={styles.menu_text}>{menuText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getTextStyle = (color, fontSize) => ({
  fontSize: responsiveFontSize(fontSize),
  color,
});

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 45,
  },
  profile_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
    // borderWidth: 30,
    // borderColor: '#888888',
  },
  profile_title: {marginBottom: 2},
  profile_subtitle: {marginBottom: 25},
  profile_btn_txt: {
    ...getTextStyle(AppStyles.colors.white, 2.2),
    fontWeight: 'bold',
    flex: 2
  },
  menu_item: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
  },
  menu_icon: {
    marginHorizontal: 15,
  },
  menu_text: {
    ...getTextStyle('#0D6BC8', 2.2),
    fontWeight: 'bold',
    flex: 2
  },
});
