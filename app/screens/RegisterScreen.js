import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import AutoHeightWebView from 'react-native-autoheight-webview';
import AppHeading from '../components/AppHeading';
import AppProgresStep from '../components/AppProgresStep';
import AppText from '../components/AppText';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormButton from '../components/AppFormButton';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppModalBottomUp from '../components/AppModalBottomUp';
import {makeWebViewSource} from '../config/functions';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import privacyPolicyApi from '../api/privacyPolicy';
import phoneAuthApi from '../api/phoneAuth';
import usersApi from '../api/users';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;

export default function RegisterScreen({route, navigation}) {
  const ref_termsPopup = useRef();

  const [error, setError] = useState();
  const [countryCode, setCountryCode] = useState('+91');
  const [termsData, set_termsData] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTermsData();
  }, []);

  /* ===== Async API calls ===== */
  const loadTermsData = async () => {
    setIsLoading(true);
    try {
      const resp = await privacyPolicyApi.getPrivacyPolicy();
      if (resp?.ok) {
        if (resp?.data?.length) set_termsData(resp.data[0]);
      } else {
        setError(
          resp.data?.errors?.[0]?.msg || 'Error in fetching Terms & Conditions',
        );
      }
    } catch (error) {
      console.error('Error in fetching About', error);
      setError(error);
    }
    setIsLoading(false);
  };

  const signInWithPhoneSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0]?[0-9]\d{9}$/, 'Enter a valid phone number.'),
  });

  const signInWithPhoneNumber = async (data) => {
    setError('');
    setIsLoading(true);
    console.log('sign-in form data Key-Value pairs: ', data);
    const number = countryCode + data.phoneNumber;
    try {
      const checkUser = await usersApi.getUser(number);
      if (!checkUser?.ok) {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser?.problem ||
            'Something went wrong. Please try again later.',
        );
        setIsLoading(false);
      } else if (
        checkUser?.data &&
        checkUser?.data?.length > 0 &&
        checkUser?.data[0]?.phone === number
      ) {
        setError('Mobile Number Already Registered');
        setIsLoading(false);
        return;
      } else {
        const result = await phoneAuthApi.send(number);
        console.log('phoneAuthApi result =>', result);
        setIsLoading(false);
        if (result && result.data && result.data.status === 'Success') {
          const sessionId = result.data.session_id;
          navigation.navigate('VerifyOtp', {
            sessionId,
            redirect: 'register',
            number,
          });
        } else {
          setError(
            result?.problem || 'Something went wrong. Please try again later.',
          );
        }
      }
    } catch (error) {
      console.error('Error in sending request', error);
      setError(error);
    }
  };

  const signInWithPhoneNumber_DEV = async (data) => {
    setError('');
    setIsLoading(true);
    console.log('sign-in form data Key-Value pairs: ', data);
    const number = countryCode + data.phoneNumber;
    try {
      const checkUser = await usersApi.getUser(number);
      if (!checkUser?.ok) {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser?.problem ||
            'Something went wrong. Please try again later.',
        );
        setIsLoading(false);
      } else if (
        checkUser?.data &&
        checkUser?.data?.length > 0 &&
        checkUser?.data[0]?.phone === number
      ) {
        setError('Mobile Number Already Registered');
        setIsLoading(false);
        return;
      } else {
        setIsLoading(false);
        navigation.navigate('VerifyOtp', {
          sessionId: 'fake_sessionId',
          redirect: 'register',
          number,
        });
      }
    } catch (error) {
      console.error('Error in sending request', error);
      setError(error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.header}>
        <AppProgresStep
          isFirstDone={true}
          isSecondDone={false}
          colorDone={AppStyles.colors.oliveGreen}
          stepDots={6}
        />
      </View>

      {error !== '' && (
        <View>
          <AppErrorMessage showMsg={true} error={error} />
        </View>
      )}

      <AppForm
        initialValues={{phoneNumber: ''}}
        validationSchema={signInWithPhoneSchema}
        onSubmit={
          config.envName === 'DEV'
            ? signInWithPhoneNumber_DEV
            : signInWithPhoneNumber
        }>
        <View style={styles.content}>
          <AppHeading style={styles.headingText}>Create Account</AppHeading>
          <AppText style={styles.subText}>
            Enter your mobile number to get registered
          </AppText>
          <AppFormInput
            name="phoneNumber"
            isPrepend={true}
            prependText={countryCode}
            prepDivider={true}
            placeholder={'1234567890'}
            keyboardType="phone-pad"
            autoFocus
            isAppend={true}
            imageSrc={require('../assets/images/icon_checked.png')}
            style={styles.inputField}
          />
        </View>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>
            By creating an account {'\n'}
            you agree to our{' '}
            <TouchableWithoutFeedback
              onPress={() => ref_termsPopup.current.open()}>
              <Text style={styles.link_text}>Terms and Conditions</Text>
            </TouchableWithoutFeedback>
          </AppText>
          <AppFormButton btTitle={'SEND OTP'} style={{alignSelf: 'center'}} />
        </View>
      </AppForm>

      <AppModalBottomUp
        ref={ref_termsPopup}
        closeOnDragDown={false}
        height={responsiveHeight(100) - 100}
        closeButton={false}
        style_content={{flex: 1}}>
        {termsData?.title ? (
          <Text style={styles.popup_title}>{termsData.title}</Text>
        ) : null}

        <ScrollView
          style={styles.popup_scroll}
          contentContainerStyle={{flexGrow: 1}}>
          {termsData?.paragraph ? (
            <AutoHeightWebView
              originWhitelist={['*']}
              source={makeWebViewSource(termsData.paragraph)}
              style={styles.webview_content}
              customStyle={`* {font-size: 14px;}`}
            />
          ) : (
            <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
              No Terms and Conditions Found
            </Text>
          )}
        </ScrollView>

        <AppButtonSecondary
          btTitle={'CLOSE'}
          width={responsiveWidth(100) * 0.24}
          aspect_ratio={0.3}
          shadowRadius={2}
          borderRadius={4}
          fontSize={responsiveFontSize(1.8)}
          btPress={() => ref_termsPopup.current.close()}
          style={{alignSelf: 'center'}}
        />
      </AppModalBottomUp>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: AppStyles.colors.lightgrey,
  },
  header: {
    width: '100%',
    marginTop: responsiveHeight(3),
    paddingVertical: 30,
  },
  content: {
    width: WIDTH,
  },
  headingText: {
    marginBottom: responsiveHeight(3),
  },
  subText: {
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
    width: '80%',
    alignSelf: 'center',
  },
  inputField: {
    width: WIDTH,
    fontSize: responsiveFontSize(2.0),
  },
  footer: {
    width: WIDTH,
    marginTop: 'auto',
  },
  footerText: {
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
  },
  loadingcontainer: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  link_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 1.5),
  },
  popup_title: {
    ...GetTextStyle(undefined, 2.2, 'bold'),
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  popup_scroll: {
    width: responsiveWidth(100),
    alignSelf: 'center',
    marginBottom: 15,
  },
  webview_content: {
    width: responsiveWidth(100) - 30,
    backgroundColor: AppStyles.colors.lightgrey,
    alignSelf: 'center',
  },
});
