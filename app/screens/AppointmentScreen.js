import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppErrorMessage from '../components/AppErrorMessage';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import Appointment_Tab from '../components/Appointment_Tab';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {isUTCDatePast} from '../config/functions';
import appointmentApi from '../api/appointment';
import pathologyApi from '../api/pathology';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import { useTranslation } from 'react-i18next';

const WIDTH = Container_Width;

export default function AppointmentScreen({navigation, route}) {
  /* States & Context */
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  const [activeTab, set_activeTab] = useState(1);
  const [appointments, set_appointments] = useState([]);
  const [appointments_coming, set_appointments_coming] = useState([]);
  const [appointments_past, set_appointments_past] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }

  /* Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      resetStates();
      set_appointments([
        ...(await getUserAppointment()),
        ...(await getUserPathology()),
      ]);
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (appointments.length) processAppointments();
  }, [appointments]);

  function processAppointments() {
    let apnt_all = [...appointments];
    let apnt_coming = [],
      apnt_past = [];
    for (let i = 0, apnt = null; i < apnt_all.length; i++) {
      apnt = apnt_all[i];
      /* console.log(
        'apnt------------',
        apnt.appointmentDate,
        apnt.appointmentStatus,
        apnt.doctorData,
      ); */
      if (
        apnt.appointmentStatus === 'Completed' ||
        apnt.appointmentStatus === 'Cancelled' ||
        apnt.appointmentStatus === 'Doctor Dialed' ||
        apnt.appointmentStatus === 'Missed'
      ) {
        apnt.is_past = true;
        apnt_past.push(apnt);
      } else if (
        isUTCDatePast(new Date(apnt.appointmentDate), -15 * 60 * 1000)
      ) {
        apnt.is_past = true;
        if (apnt.appointmentStatus === 'Confirmed') {
          apnt.appointmentStatus = 'Past';
        }
        apnt_past.push(apnt);
      } else {
        apnt.is_past = false;
        apnt_coming.push(apnt);
      }
    }
    set_appointments_coming(sortByDateTime(apnt_coming, 'appointmentDate'));
    set_appointments_past(apnt_past);
  }

  function sortByDateTime(arrayIn, sortKey, sortOrder = 0) {
    return arrayIn.sort((a, b) =>
      !sortOrder
        ? new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
        : new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime(),
    );
  }

  /* Async api calls */
  const getUserAppointment = async () => {
    setIsLoading(true);
    let apnt_list = [];
    try {
      const resp = await appointmentApi.getAppointment(user._id);
      if (resp?.ok) {
        if (resp?.data?.length) apnt_list = resp.data;
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in fetching Appointment list',
        );
      }
    } catch (error) {
      console.log('appointmentApi.getAppointment catch =>', error);
      setError(error?.message || 'Error in fetching Appointments');
    }
    // set_appointments(apnt_list);
    setIsLoading(false);
    return apnt_list;
  };

  const getUserPathology = async () => {
    setIsLoading(true);
    let path_list = [];
    try {
      const resp = await pathologyApi.getPathology(user._id);
      if (resp?.ok) {
        if (resp?.data?.length) path_list = resp.data;
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in fetching Pathology list',
        );
      }
    } catch (error) {
      console.log('pathologyApi.getPathology catch =>', error);
      setError(error?.message || 'Error in fetching Pathologies');
    }
    setIsLoading(false);
    return path_list;
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.content}>
        <View style={styles.section}>
          <MyAppointments navigation={navigation} />
        </View>

        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        {appointments.length ? (
          <View style={styles.tab_panel}>
            <View style={styles.tab_head}>
              <AppButtonSecondary
                isPressed={activeTab === 1}
                btTitle={t('upcoming')}
                width={(8 + 2) * 0.02 * responsiveWidth(100)}
                height={responsiveWidth(100) * 0.064}
                borderRadius={4}
                fontSize={responsiveFontSize(1.5)}
                style={{marginRight: 12}}
                btPress={() => set_activeTab(1)}
              />
              <AppButtonSecondary
                isPressed={activeTab === 2}
                btTitle={t('past')}
                width={(4 + 2) * 0.02 * responsiveWidth(100)}
                height={responsiveWidth(100) * 0.064}
                borderRadius={4}
                fontSize={responsiveFontSize(1.5)}
                style={{marginRight: 12}}
                btPress={() => set_activeTab(2)}
              />
            </View>

            <View style={styles.tab_body}>
              {activeTab === 1 ? (
                <Appointment_Tab
                  appointments={appointments_coming}
                  navigation={navigation}
                />
              ) : (
                <Appointment_Tab
                  appointments={appointments_past}
                  navigation={navigation}
                />
              )}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const MyAppointments = ({navigation}) => {
  const {t, i18n} = useTranslation();
  return (
    <AppBoxShadowInner
      height={responsiveWidth(100) * 0.5}
      content_style={AppStyles.centerXY}>
      <View style={{flex: 1, ...AppStyles.centerXY}}>
        <View style={{width: '72%', marginBottom: 20}}>
          <AppHeading
            style={{fontSize: responsiveFontSize(2.6), marginBottom: 3}}>
            {t('my_appointments')}
          </AppHeading>
          <AppPara
            style={{
              textAlign: 'center',
              lineHeight: 14,
              marginBottom: 2,
            }}>
            {t('my_appointments_descr')}
          </AppPara>
        </View>

        <View style={styles.btn_group}>
          <View
            style={{
              flex: 1,
              paddingRight: 5,
            }}>
            <AppButtonPrimary
              btTitle={t('book_test')}
              style={{alignSelf: 'flex-end'}}
              width={responsiveWidth(100) * 0.37}
              aspect_ratio={0.23}
              shadowRadius={2}
              borderRadius={5}
              textSize={responsiveFontSize(1.6)}
              gradientBorderWidth={2}
              gradientColorArray={['#e5a818', '#e89e0b', '#eb9500']}
              btPress={() => navigation.navigate('BookTest')}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: 5,
            }}>
            <AppButtonPrimary
              btTitle={t('book_appointment')}
              style={{alignSelf: 'flex-start'}}
              width={responsiveWidth(100) * 0.37}
              aspect_ratio={0.23}
              shadowRadius={2}
              borderRadius={5}
              textSize={responsiveFontSize(1.6)}
              gradientBorderWidth={2}
              btPress={() => navigation.navigate('FindDoctor')}
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
    paddingTop: 80,
    paddingBottom: 0,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
  },
  section: {
    flexShrink: 1,
    marginBottom: 35,
  },
  tab_panel: {
    flex: 1,
  },
  btn_group: {
    flexDirection: 'row',
  },
  tab_head: {
    flexShrink: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab_body: {
    flex: 1,
  },
});
