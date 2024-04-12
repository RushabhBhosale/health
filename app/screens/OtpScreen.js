import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppHeading from '../components/AppHeading';
import AppProgresStep from '../components/AppProgresStep';
import AppText from '../components/AppText';
import AppInputOtp from '../components/AppInputOtp';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppForm from '../components/AppForm';
import AppFormError from '../components/AppFormError';
import AppErrorMessage from '../components/AppErrorMessage';
import AppStyles, {Container_Width} from '../config/style';
import phoneAuthApi from '../api/phoneAuth';
import verifyPhoneAuthApi from '../api/verifyPhoneAuth';
import usersApi from '../api/users';
import useAuth from '../auth/useAuth';
import authApi from '../api/auth';
import LoadingIndicator from '../components/LoadingIndicator';
import notificationApi from '../api/notification';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;
export const IsAndroid = Platform.OS === 'android' ? true : false;

export default function OtpScreen({route, navigation}) {
  const {sessionId, number, redirect, DummyAccount} = route.params;

  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSessionId, set_otpSessionId] = useState(sessionId);
  const [otpError, setOtpError] = useState('');
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  /* Async api calls */
  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const otpResp = await phoneAuthApi.send(number);
      if (otpResp?.data?.Status === 'Success') {
        set_otpSessionId(otpResp.data.Details);
      } else {
        setError(otpResp.problem || 'Server Error');
      }
    } catch (resendOtpErr) {
      console.log('resend OTP catch block : ', resendOtpErr);
      setError(resendOtpErr);
    }
    setIsLoading(false);
  };

  const confirmCode = async () => {
    try {
      setOtpSubmitted(true);
      setIsLoading(true);
      if (DummyAccount && redirect !== 'register') {
        if (verificationCode === DummyAccount.otp) {
          const loginResult = await authApi.login({phone: number});
          console.log('Login Result => ', loginResult);
          if (!loginResult.ok)
            return setError(
              loginResult?.data?.errors?.[0]?.msg || 'Login Failed',
            );
          if (loginResult?.data?.token) {
            await auth.login(loginResult.data.token, loginResult.data.user);
          } else {
            setError('An unexpected Error occoured.');
          }
        } else {
          setError('Please enter a valid OTP.');
        }
      } else {
        const result = await verifyPhoneAuthApi.send(
          otpSessionId,
          verificationCode,
        );
        if (result?.data?.Status === 'Success') {
          if (redirect === 'register') {
            const user = await usersApi.registerPhone({phone: number});
            if (!user.ok) {
              setError(user.problem);
            } else {
              if (user?.data?.token) {
                const setUserData = await auth.login(user.data.token);

                const notiObj = {
                  noteFor: 'Admin',
                  noteType: 'Register',
                  title: `Dear admin, a new patient user has been accessed into Healthnovo application`,
                  userId: config.hnAdminId,
                  patient: setUserData.id,
                  doctor: null,
                  noteData: null,
                };
                const notificationResponse =
                  await notificationApi.postAdminNotification(notiObj);
                if (!notificationResponse?.ok) {
                  setError(
                    notificationResponse?.data?.errors?.[0]?.msg ||
                      'Error in posting Admin Notification',
                  );
                }
                navigation.navigate('PersonalDetails', {number, redirect});
              } else {
                setError('An unexpected Error occoured.');
              }
            }
          } else {
            const loginResult = await authApi.login({phone: number});
            console.log('Login Result => ', loginResult);
            if (!loginResult.ok)
              return setError(
                loginResult?.data?.errors?.[0]?.msg || 'Login Failed',
              );
            if (loginResult?.data?.token) {
              await auth.login(loginResult.data.token, loginResult.data.user);
            } else {
              setError('An unexpected Error occoured.');
            }
          }
        } else {
          setError('Invalid Token.');
        }
      }
    } catch (error) {
      setError('Token Error Catch.');
    }
    setIsLoading(false);
  };

  const confirmCode_DEV = async () => {
    try {
      setOtpSubmitted(true);
      setIsLoading(true);
      if (redirect === 'register') {
        const user = await usersApi.registerPhone({phone: number});
        if (!user?.ok) {
          setError(
            user?.data?.errors?.[0]?.msg ||
              user?.problem ||
              'Error in Register Phone',
          );
        } else {
          if (user?.data?.token) {
            const setUserData = await auth.login(user.data.token);

            const notiObj = {
              noteFor: 'Admin',
              noteType: 'Register',
              title: `Dear admin, a new patient user has been accessed into Healthnovo application`,
              userId: config.hnAdminId,
              patient: setUserData.id,
              doctor: null,
              noteData: null,
            };
            const notificationResponse =
              await notificationApi.postAdminNotification(notiObj);
            if (!notificationResponse?.ok)
              setError(
                notificationResponse?.data?.errors?.[0]?.msg ||
                  'Error in posting Admin Notifications',
              );
            navigation.navigate('PersonalDetails', {number, redirect});
          } else {
            setError('An unexpected Error occoured.');
          }
        }
      } else {
        const loginResult = await authApi.login({phone: number});
        console.log('Login Result => ', loginResult);
        if (!loginResult?.ok)
          return setError(
            loginResult?.data?.errors?.[0]?.msg || 'Login Failed.',
          );
        if (loginResult?.data?.token) {
          await auth.login(loginResult.data.token, loginResult.data.user);
        } else {
          setError('An unexpected Error occoured.');
        }
      }
    } catch (error) {
      setError('Token Error Catch.');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      {redirect === 'register' ? (
        <View style={styles.section}>
          <AppProgresStep
            isFirstDone={true}
            isSecondDone={false}
            colorDone={AppStyles.colors.oliveGreen}
            stepDots={6}
          />
        </View>
      ) : null}

      {error !== '' && (
        <View>
          <AppErrorMessage showMsg={true} error={error} />
        </View>
      )}

      <AppForm>
        <View style={styles.content}>
          <AppHeading style={styles.headingText}>Verify your number</AppHeading>
          <AppText style={styles.subText}>
            You will receive an OTP as an SMS in your mobile number.
          </AppText>
          <AppInputOtp
            controlWidth={responsiveWidth(12)}
            controlHeight={responsiveWidth(12)}
            backgroundColor={AppStyles.colors.oliveGreen}
            fontSize={responsiveFontSize(3.0)}
            otpValue={verificationCode}
            setOtpValue={setVerificationCode}
          />
          <AppFormError
            showMsg={otpSubmitted}
            error={otpError}
            style={{textAlign: 'center', marginTop: 25}}
          />
          {
            !IsAndroid ?
            <>
            <AppText style={styles.footerText}>
              If you didn’t receive the code,
              <Text
                style={{color: AppStyles.colors.linkcolor}}
                onPress={resendOTP}>
                {' '}
                click resend
              </Text>
            </AppText>
            <AppButtonPrimary
              btTitle={'CONTINUE'}
              btPress={config.envName === 'DEV' ? confirmCode_DEV : confirmCode}
              style={{alignSelf: 'center'}}
            />
            </>
            : null
          }
        </View>

        <View style={styles.footer}>
          {
            IsAndroid ?
            <>
            <AppText style={styles.footerText}>
              If you didn’t receive the code,
              <Text
                style={{color: AppStyles.colors.linkcolor}}
                onPress={resendOTP}>
                {' '}
                click resend
              </Text>
            </AppText>
            <AppButtonPrimary
              btTitle={'CONTINUE'}
              btPress={config.envName === 'DEV' ? confirmCode_DEV : confirmCode}
              style={{alignSelf: 'center'}}
            />
            </>
            : null
          }
        </View>
      </AppForm>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: AppStyles.colors.lightgrey,
  },
  section: {
    marginTop: responsiveHeight(5),
    marginBottom: responsiveHeight(9),
    width: '100%',
  },
  content: {
    flex: 1,
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
  footer: {
    position: "absolute",
    //marginTop: 'auto',
    top: "60%",
    width: WIDTH,
  },
  footerText: {
    marginTop: 20,
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
  },
});
