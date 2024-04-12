import React, {useState, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import AppLogo from '../components/AppLogo';
import AppHeading from '../components/AppHeading';
import AppText from '../components/AppText';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormButton from '../components/AppFormButton';
import AppErrorMessage from '../components/AppErrorMessage';
import AppStyles, {Container_Width} from '../config/style';
import phoneAuthApi from '../api/phoneAuth';
import LoadingIndicator from '../components/LoadingIndicator';
import usersApi from '../api/users';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;
export const IsAndroid = Platform.OS === 'android' ? true : false;

export default function LoginScreen02({navigation}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const loginWithPhoneSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0]?[0-9]\d{9}$/, 'Enter a valid phone number.'),
  });

  const loginWithPhoneNumber = async (data) => {
    const number = countryCode + data.phoneNumber;
    setIsLoading(true);
    try {
      const checkUser = await usersApi.getUser(number);
      if (!checkUser?.ok) {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser?.problem ||
            'Something went wrong. Please try again later.',
        );
      } else if (
        checkUser?.data &&
        checkUser?.data?.length > 0 &&
        checkUser?.data[0]?.phone === number
      ) {
        const dummy_acnt = config.dummy_accounts.find(
          (acnt) => acnt.phone === number,
        );
        if (dummy_acnt) {
          navigation.navigate('VerifyOtp', {
            sessionId: 'fake_sessionId',
            redirect: 'login',
            number,
            DummyAccount: dummy_acnt,
          });
        } else {
          const result = await phoneAuthApi.send(number);
          if (result && result.data && result.data.status === 'Success') {
            const sessionId = result.data.session_id;
            navigation.navigate('VerifyOtp', {
              sessionId,
              redirect: 'login',
              number,
            });
          } else {
            setError(result.problem || 'Server Error');
          }
        }
      } else if (
        checkUser?.ok === true &&
        checkUser?.data &&
        checkUser?.data?.length <= 0
      ) {
        setError('Mobile Number Not Registered. Please Register.');
      } else {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser?.problem ||
            'Something went wrong. Please try again later.',
        );
        return;
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  const loginWithPhoneNumber_DEV = async (data) => {
    const number = countryCode + data.phoneNumber;
    setIsLoading(true);
    try {
      const checkUser = await usersApi.getUser(number);
      if (!checkUser.ok) {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser.problem ||
            'Something went wrong. Please try again later.',
        );
      } else if (
        checkUser?.data &&
        checkUser?.data?.length > 0 &&
        checkUser?.data[0]?.phone === number
      ) {
        navigation.navigate('VerifyOtp', {
          sessionId: 'fake_sessionId',
          redirect: 'login',
          number,
        });
      } else if (
        checkUser?.ok === true &&
        checkUser?.data &&
        checkUser?.data?.length <= 0
      ) {
        setError('Mobile Number Not Registered. Please Register.');
      } else {
        setError(
          checkUser?.data?.errors?.[0]?.msg ||
            checkUser.problem ||
            'Something went wrong. Please try again later.',
        );
        return;
      }
    } catch (error) {
      console.error('Error in sending request', error);
      setError(error);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <AppForm
        initialValues={{phoneNumber: ''}}
        validationSchema={loginWithPhoneSchema}
        onSubmit={
          config.envName === 'DEV'
            ? loginWithPhoneNumber_DEV
            : loginWithPhoneNumber
        }>
        <View style={styles.header}>
          <AppLogo width={responsiveWidth(16.5)} />
        </View>
        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.content}>
          <AppHeading style={styles.headingText}>
            Login to your Patient Account
          </AppHeading>
          <AppText style={styles.subText}>
            I am a new User, {'\n'}want to{' '}
            <Text
              style={{color: AppStyles.colors.linkcolor}}
              onPress={() => {
                navigation.navigate('Register');
              }}>
              Create Account
            </Text>
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
          {
            !IsAndroid ?
            <AppFormButton btTitle={'LOGIN'} style={{alignSelf: 'center', marginTop: 20}} />
            : null
          }
        </View>

        <View style={styles.footer}>
          {
            IsAndroid ?
          <AppFormButton btTitle={'LOGIN'} style={{alignSelf: 'center'}} />
          : null }
        </View>
      </AppForm>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 50,
    alignItems: 'center',
    backgroundColor: AppStyles.colors.lightgrey,
  },
  header: {
    flex: 2,
    marginBottom: responsiveHeight(5),
  },
  content: {
    flex: 9,
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
  footer: IsAndroid ? {
    flex: 2,
    width: WIDTH,
    justifyContent: 'flex-end',
    marginTop: 'auto',
  } : {
    //flex: 2,
    width: WIDTH,
    //justifyContent: 'flex-end',
    //marginTop: 'auto',
    position: "absolute",
    top: "60%"
  },
});
