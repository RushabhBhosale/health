import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, ScrollView, Linking} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppBoxShadow from '../components/AppBoxShadow';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import About_Tab from '../components/About_Tab';
import FAQ_Tab from '../components/FAQ_Tab';
import AppSettings_Tab from '../components/AppSettings_Tab';
import AppErrorMessage from '../components/AppErrorMessage';
import aboutUsApi from '../api/about';
import visionApi from '../api/vision';
import faqApi from '../api/faq';
import privacyPolicyApi from '../api/privacyPolicy';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;

export default function AboutScreen({navigation, route}) {
  const {user, setUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, set_activeTab] = useState(1);
  const [aboutData, set_aboutData] = useState();
  const [visionData, set_visionData] = useState();
  const [faqData, set_faqData] = useState();
  const [settingData, set_settingData] = useState();
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      if (route?.params?.showTabActive) {
        const {showTabActive} = route?.params;
        set_activeTab(showTabActive);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadDetails();
  }, []);

  /* ===== Async API calls ===== */
  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const resp_about = await aboutUsApi.getAboutUs();
      if (resp_about?.ok) {
        if (resp_about?.data?.length) set_aboutData(resp_about.data[0]);
      } else {
        setError(
          resp_about.data?.errors?.[0]?.msg || 'Error Loading the About us',
        );
      }

      const resp_vision = await visionApi.getVision();
      if (resp_vision?.ok) {
        if (resp_vision?.data?.length) set_visionData(resp_vision.data[0]);
      } else {
        setError(
          resp_vision.data?.errors?.[0]?.msg || 'Error Loading the Vision',
        );
      }

      const resp_faq = await faqApi.getFAQ();
      if (resp_faq?.ok) {
        if (resp_faq?.data?.length) set_faqData(resp_faq.data);
      } else {
        setError(resp_faq.data?.errors?.[0]?.msg || 'Error Loading the FAQ');
      }

      const APP_SETTINGS = {
        APP_VERSION: {
          title: 'App Version 1.10 Installed',
          content:
            'Check if you have the latest update - keep up to date with your app for timely updates',
          button_title: 'CHECK FOR UPDATE',
          image: require('../assets/images/phone_held_2.png'),
        },
        PRIVACY_POLICY: {},
      };

      const resp_privacy = await privacyPolicyApi.getPrivacyPolicy();
      if (resp_privacy?.ok) {
        if (resp_privacy?.data?.length) {
          APP_SETTINGS.PRIVACY_POLICY = resp_privacy.data[0];
          set_settingData(APP_SETTINGS);
        }
      } else {
        setError(
          resp_privacy.data?.errors?.[0]?.msg ||
            'Error in fetching Privacy Policy',
        );
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching About', error);
      setError(error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.content}>
        <View style={styles.section}>
          <BoxPanel navigation={navigation} />
        </View>

        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.tab_panel}>
          <View style={styles.tab_head}>
            <AppButtonSecondary
              isPressed={activeTab === 1}
              btTitle="ABOUT"
              width={(5 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(1)}
            />
            <AppButtonSecondary
              isPressed={activeTab === 2}
              btTitle="FAQS"
              width={(4 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(2)}
            />
            <AppButtonSecondary
              isPressed={activeTab === 3}
              btTitle="TERMS & CONDITIONS"
              width={(16 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(3)}
            />
          </View>

          <ScrollView
            style={styles.tab_body}
            contentContainerStyle={{flexGrow: 1}}>
            {activeTab === 1 ? (
              <About_Tab
                aboutus={aboutData}
                vision={visionData}
                navigation={navigation}
              />
            ) : activeTab === 2 ? (
              <FAQ_Tab tabData={faqData} navigation={navigation} />
            ) : (
              <AppSettings_Tab tabData={settingData} navigation={navigation} />
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const BoxPanel = ({navigation}) => {
  return (
    <AppBoxShadowInner
      aspect_ratio={205 / 297}
      content_style={AppStyles.centerXY}>
      <View style={styles.box_panel}>
        {/* <View style={styles.box_ratings}>
          <Text style={GetTextStyle(undefined, 2.2)}>4.5</Text>
          <AppBoxShadow
            width={24}
            aspect_ratio={1 / 1}
            borderRadius={30}
            style={{marginLeft: 5}}
            content_style={AppStyles.centerXY}>
            <Image
              style={{width: '60%', resizeMode: 'contain'}}
              source={require('../assets/images/icon_star_golden.png')}
            />
          </AppBoxShadow>
        </View> */}
        <AutoHeightImage
          width={responsiveWidth(100) * 0.23}
          style={{marginBottom: 6}}
          source={require('../assets/images/logo.png')}
        />
        <AppHeading style={styles.box_title}>HealthNovo+</AppHeading>
        {/* <AppPara style={styles.box_sub_text}>
          Description of the app will come here..
        </AppPara> */}

        <View style={styles.btn_group}>
          <View
            style={{
              flex: 1,
              paddingRight: 5,
            }}>
            <AppButtonPrimary
              btTitle={'RATE US'}
              style={{alignSelf: 'flex-end'}}
              width={responsiveWidth(100) * 0.36}
              aspect_ratio={0.23}
              shadowRadius={2}
              borderRadius={5}
              gradientBorderWidth={2}
              textSize={responsiveFontSize(1.5)}
              btPress={() => Linking.openURL(config.playStoreLink)}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: 5,
            }}>
            <AppButtonSecondary
              btTitle={'WRITE A REVIEW'}
              style={{alignSelf: 'flex-start'}}
              width={responsiveWidth(100) * 0.36}
              aspect_ratio={0.23}
              shadowRadius={2}
              borderRadius={5}
              fontSize={responsiveFontSize(1.5)}
              btPress={() => Linking.openURL(config.playStoreLink)}
            />
          </View>
        </View>
      </View>
    </AppBoxShadowInner>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    marginTop: IsAndroid ? 80 : 80,
  },
  section: {
    flexShrink: 1,
    marginBottom: 28,
  },
  box_panel: {
    flex: 1,
    width: '90%',
    ...AppStyles.centerXY,
  },
  box_ratings: {
    position: 'absolute',
    top: 13,
    right: 14,
    flexDirection: 'row',
  },
  box_title: {
    ...GetTextStyle(undefined, 2.6, 'bold', 'center'),
    marginBottom: 20,
  },
  box_sub_text: {
    ...GetTextStyle(undefined, 1.5, undefined, 'center'),
    marginBottom: 12,
  },
  btn_group: {
    flexDirection: 'row',
  },
  tab_panel: {
    flex: 1,
  },
  tab_head: {
    flexShrink: 1,
    flexDirection: 'row',
    marginBottom: 25,
  },
  tab_body: {
    flex: 1,
    width: responsiveWidth(100),
    alignSelf: 'center',
  },
});
