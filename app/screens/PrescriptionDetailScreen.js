import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  Modal,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import moment from 'moment';
import AutoHeightImage from 'react-native-auto-height-image';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import ScreenScrollable from '../components/ScreenScrollable';
import AppSelectInput from '../components/AppSelectInput';
import AppHeading from '../components/AppHeading';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import {DividerX} from '../components/AppCommonComponents';
import AppPanelBasicPlus from '../components/AppPanelBasicPlus';
import AppButtonBasic from '../components/AppButtonBasic';
import LoadingIndicator from '../components/LoadingIndicator';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import AppErrorMessage from '../components/AppErrorMessage';
import {ToComePopup} from '../utility/alert-boxes';
import AuthContext from '../auth/context';
import {dd_Mon_YYYY_Day, makeFullName, getFullUrl} from '../config/functions';
import prescriptionApi from '../api/prescription';
import ReminderAlerts from './Reminders';
import prescription from '../api/prescription';
import Reminders from './Reminders';

const WIDTH = Container_Width;
const IMG_SCHEDULE = require('../assets/images/calendar_green.png');
const IMG_INTERVAL = require('../assets/images/clock_alarm.png');
const IMG_BREAKFAST = require('../assets/images/sun_rise.png');
const IMG_LUNCH = require('../assets/images/sun_miday.png');
const IMG_DINNER = require('../assets/images/sun_set.png');
const ICON_MAPPING = {
  session_1: IMG_BREAKFAST,
  session_2: IMG_LUNCH,
  session_3: IMG_DINNER,
};
const PERIOD_MAPPING = {
  Daily: 'Everyday',
  Weekly: 'Everyweek',
  Monthly: 'Everymonth',
};

export default function PrescriptionDetailScreen({navigation, route}) {
  const {user, setUser} = useContext(AuthContext);

  /* State Variables */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [Appointment, set_Appointment] = useState();
  const [Prescription, set_Prescription] = useState();
  const [Doctor, set_Doctor] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDropdown, set_currentDropdown] = useState(6);
  const [beforeB, set_beforeB] = useState({id: '7', slotMasterId: '10', slot: '08:00'},);
  const [afterB, set_afterB] = useState({id: '10', slotMasterId: '11', slot: '09:30'});
  const [beforeL, set_beforeL] = useState({id: '5', slotMasterId: '9', slot: '13:00'});
  const [afterL, set_afterL] = useState({id: '8', slotMasterId: '10', slot: '14:30'});
  const [beforeD, set_beforeD] = useState({id: '11', slotMasterId: '15', slot: '20:00'});
  const [afterD, set_afterD] = useState({id: '14', slotMasterId: '18', slot: '21:30'});
  const [timings, setTimings] = useState(false);
  const [error, setError] = useState('');

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.APPOINTMENT) {
        set_Appointment(route.params.APPOINTMENT);
      } else if (route?.params?.PrescriptionId) {
        getPrescription(route.params.PrescriptionId);
      }
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (Appointment?._id) {
      getPrescriptionByAppointment();
    }
  }, [Appointment]);

  /* Form */
  function getFormData() {
    return {
      beforeBreakfast: null,
      doctor: null,
      user_notes: '',
    };
  }

  useEffect(() => {
    if (Prescription?.appointmentInfo?.doctorData)
      set_Doctor(Prescription.appointmentInfo.doctorData);
  }, [Prescription]);

  const getPrescriptionByAppointment = async () => {
    setIsLoading(true);
    try {
      const resp = await prescriptionApi.getPrescriptionByAppointment(
        Appointment._id,
      );
      if (resp?.ok) {
        if (resp?.data?._id) {
          console.log("PRESCRIPTION DETAILS!", resp.data);
          set_Prescription(resp.data);
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching Prescription details',
        );
      }
    } catch (error) {
      console.error('Prescription Fetching Failed', error);
      setError('An unexpected Server Error occoured.');
    }
    setIsLoading(false);
  };

  const testReminder = async () => {
    Reminders.testNotification();
  }

  const setAlertReminders = async () => {
    setTimings(true);
  }

  const setReminder = async () => {
    try {
      if(Prescription.alert) {
        const resp = await prescriptionApi.disablePrescription_Alert(
          Prescription._id,
        );
        console.log(resp);
        if (resp?.ok) {
          console.log("PRESCRIPTION ALERT DISABLED!", resp?.data);
          set_Prescription({ ...Prescription, alert: false});
          Reminders.scheduleAlert(Prescription, Prescription.alertid, false);
        } else {
          setError(
            resp?.data?.errors?.[0]?.msg ||
              'Error in disabling reminders',
          );
        }
      } else {
        var alert_time = (new Date()).getTime().toString();
        const resp = await prescriptionApi.enablePrescription_Alert(
          Prescription._id,
          alert_time.substring(6)
        );
        console.log(resp);
        if (resp?.ok) {
          console.log("PRESCRIPTION ALERT ENABLED! ID="+alert_time.substring(6), resp?.data);
          //ToastAndroid.show('Reminders Enabled!', 1000);
          set_Prescription({ ...Prescription, alert: true});
          Reminders.scheduleAlert(Prescription, alert_time.substring(6), true, {beforeBreakfast: beforeB, afterBreakfast: afterB, beforeLunch: beforeL, afterLunch: afterL, beforeDinner: beforeD, afterDinner: afterD});
          setTimings(false);
        } else {
          setError(
            resp?.data?.errors?.[0]?.msg ||
              'Error in enabling reminders',
          );
        }
      }
    } catch (error) {
      console.error('Prescription alerts updation Failed', error);
      setError('An unexpected Server Error occoured.');
    }
  };

  /* Select Dropdown */
  const openSelectDropdown = (dropdown) => {
    set_isScreenScrollable(false);
    set_currentDropdown(dropdown);
  };

  const closeSelectDropdown = (dropdown) => {
    set_isScreenScrollable(true);
    set_currentDropdown(dropdown);
  };

  const getAge = (birthdate) => {
    const today = new Date();
    const age = today.getFullYear() - birthdate.getFullYear() - 
               (today.getMonth() < birthdate.getMonth() || 
               (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate()));
    return age;
  }

  const getPrescription = async (prescId) => {
    setIsLoading(true);
    try {
      const resp = await prescriptionApi.getPrescriptionById(prescId);
      if (resp?.ok) {
        if (resp?.data?._id) {
          set_Prescription(resp.data);
          console.log(resp.data);
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching Prescription details',
        );
      }
    } catch (error) {
      console.error('Prescription Fetching Failed', error);
      setError('An unexpected Server Error occoured.');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <ScreenScrollable
        style={styles.scrollContainer}
        scrollEnabled={isScreenScrollable}
        keyboardShouldPersistTaps="handled">
        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.content}>
          <AppHeading style={styles.headingText}>
            Prescription Details
          </AppHeading>

          <View style={{}}>
            <Text style={styles.header}>
              {makeFullName(Doctor?.firstName, Doctor?.lastName, 'Dr.')}
            </Text>
            {Doctor?.education?.length ? (
              <Text style={styles.sub_header(5)}>
                {Doctor?.education[0]?.highestQualification
                  ? `${Doctor.education[0].highestQualification}, `
                  : null}
                {Doctor?.education[0]?.university
                  ? `${Doctor.education[0].university}`
                  : null}
              </Text>
            ) : null}
            {Doctor?.registration ? (
              <Text style={styles.sub_header(5)}>
                {Doctor?.registration?.regNumber
                  ? `Registration : ${Doctor.registration.regNumber}`
                  : null}
              </Text>
            ) : null}
            {Doctor?.clinic?.length ? (
              <Text style={styles.sub_header(15)}>
                {Doctor?.clinic[0]?.clinicName
                  ? `${Doctor.clinic[0].clinicName}, `
                  : null}
                {Doctor?.clinic[0]?.clinicAddress
                  ? `${Doctor.clinic[0].clinicAddress}, `
                  : null}
                {Doctor?.clinic[0]?.clinicCity
                  ? `${Doctor.clinic[0].clinicCity}, `
                  : null}
                {Doctor?.clinic[0]?.clinicState
                  ? `${Doctor.clinic[0].clinicState}, `
                  : null}
                {Doctor?.clinic[0]?.clinicPincode
                  ? `${Doctor.clinic[0].clinicPincode}`
                  : null}
              </Text>
            ) : null}
            <Text style={styles.rx_text}>Rx</Text>
          </View>

          <View style={styles.section()}>
            <Text style={styles.section_heading()}>
              Date of Prescription :{' '}
              {dd_Mon_YYYY_Day(new Date(Prescription?.prescriptionDate))}
            </Text>
            <Text style={styles.section_para}>
              {Prescription?.notes_to_patient}
            </Text>
          </View>

          <View style={styles.section()}>
            <Text style={styles.section_heading()}>Further Investigation</Text>
            <Text style={styles.section_para}>
              {Prescription?.further_investigation}
            </Text>
          </View>

          <View style={styles.section()}>
            <Text style={styles.section_heading()}>Patient Details</Text>
            <Text style={styles.section_para}>
              {Prescription?.appointmentInfo?.patient?.firstName} {Prescription?.appointmentInfo?.patient?.lastName}{Prescription?.appointmentInfo?.patient?.dob !== "" ? '\n' + getAge(new Date(Prescription?.appointmentInfo?.patient?.dob)) + 'y / ' : '\n'}{Prescription?.appointmentInfo?.patient?.gender}
            </Text>
          </View>

          <View style={styles.section()}>
            <Text style={styles.section_heading(0)}>Added Medicines</Text>
            {Prescription?.medications?.length ? (
              Prescription?.medications.map((item, index) => (
                <AddedMedicine
                  key={'medicine-' + index}
                  med={item}
                  index={index}
                />
              ))
            ) : (
              <Text style={styles.section_para}>No medicines added</Text>
            )}
          </View>

          {Prescription?.docFile?.uri ? (
            <View style={styles.section(30)}>
              <Text style={styles.section_heading(15)}>Prescription Image</Text>
              <View style={{alignSelf: 'flex-start', marginTop: 0}}>
                <TouchableWithoutFeedback
                  onPress={() =>
                    openDocument(
                      Prescription.docFile,
                      Prescription.appointmentId,
                      setIsLoading,
                    )
                  }>
                  <AutoHeightImage
                    source={{
                      uri: getFullUrl(
                        Prescription.docFile.uri,
                        'appointments/' + Prescription.appointmentId + '/',
                      ),
                    }}
                    width={WIDTH / 2}
                    style={{
                      borderRadius: 10,
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
          ) : null}

          <View style={styles.section(25)}>
            <Text style={styles.section_heading()}>Follow UP</Text>
            {Prescription?.follow_up_period &&
            Prescription?.appointmentInfo?.appointmentDate ? (
              <Text style={styles.section_para}>
                After {Prescription.follow_up_period} Days,{' '}
                {dd_Mon_YYYY_Day(
                  moment
                    .utc(Prescription.appointmentInfo.appointmentDate)
                    .add(Prescription.follow_up_period, 'days')
                    .toDate(),
                )}
              </Text>
            ) : (
              <Text style={styles.section_para}>Not Required</Text>
            )}
          </View>

          {/* <View style={styles.section(25)}>
            <Text style={styles.section_heading(10)}>Added Health Tips</Text>
            <HealthTipsCard />
          </View> */}
          <View style={styles.btn_group}>
            {
            (Prescription !== undefined && Prescription.medications.length > 0) ?
            <View style={{ flex: 1, paddingRight: 5, }}>
              {
                (Prescription.alert == true) ?
                <AppButtonPrimary
                  btTitle={'STOP ALERTS'}
                  width={responsiveWidth(100) * 0.37}
                  aspect_ratio={0.23}
                  shadowRadius={2}
                  borderRadius={5}
                  textSize={responsiveFontSize(1.6)}
                  gradientBorderWidth={2}
                  gradientColorArray={['#e5a818', '#e89e0b', '#eb9500']}
                  btPress={setReminder}
                />
                :
                <AppButtonPrimary
                    btTitle="SET REMINDERS"
                    width={responsiveWidth(100) * 0.37}
                    aspect_ratio={0.23}
                    shadowRadius={2}
                    borderRadius={5}
                    textSize={responsiveFontSize(1.6)}
                    gradientBorderWidth={2}
                    btPress={setAlertReminders}
                />
              }
            </View>
                : null
            }
            {/* <View style={{ flex: 1, paddingRight: 5, }}>
                <AppButtonPrimary
                    btTitle="TEST REMINDER (20secs)"
                    width={responsiveWidth(100) * 0.37}
                    aspect_ratio={0.23}
                    shadowRadius={2}
                    borderRadius={5}
                    textSize={responsiveFontSize(1.6)}
                    gradientBorderWidth={2}
                    btPress={testReminder}
                />
            </View> */}
            <View style={{ flex: 1, paddingLeft: 5, }}>
              <AppButtonSecondary
                btTitle={'CLOSE'}
                width={responsiveWidth(100) * 0.16}
                aspect_ratio={0.39}
                shadowRadius={3}
                borderRadius={4}
                btPress={() => navigation.goBack()}
              />
            </View>
          </View>
        </View>
        <Modal visible={timings} animationType="slide" backgroundColor={AppStyles.colors.lightgrey}>
          <View style={{flex: 1, backgroundColor: AppStyles.colors.lightgrey, padding: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: '#369'}}>Set Reminder Timings</Text>
              <AppButtonSecondary
                btTitle={'CLOSE'}
                width={responsiveWidth(100) * 0.16}
                aspect_ratio={0.39}
                shadowRadius={3}
                borderRadius={4}
                btPress={() => setTimings(false)}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>Before Breakfast:</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '3', slotMasterId: '8', slot: '06:00'},
                  {id: '4', slotMasterId: '8', slot: '06:30'},
                  {id: '5', slotMasterId: '9', slot: '07:00'},
                  {id: '6', slotMasterId: '9', slot: '07:30'},
                  {id: '7', slotMasterId: '10', slot: '08:00'},
                  {id: '8', slotMasterId: '10', slot: '08:30'},
                  {id: '9', slotMasterId: '11', slot: '09:00'},
                  {id: '10', slotMasterId: '11', slot: '09:30'},
                  {id: '11', slotMasterId: '12', slot: '10:00'},
                  {id: '12', slotMasterId: '12', slot: '10:30'},
                  {id: '13', slotMasterId: '13', slot: '11:00'},
                  {id: '14', slotMasterId: '13', slot: '11:30'}
                ]}
                isOpen={currentDropdown === 0}
                openSelect={() => openSelectDropdown(0)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={beforeB}
                set_selectedOption={set_beforeB}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>After Breakfast</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '3', slotMasterId: '8', slot: '06:00'},
                  {id: '4', slotMasterId: '8', slot: '06:30'},
                  {id: '5', slotMasterId: '9', slot: '07:00'},
                  {id: '6', slotMasterId: '9', slot: '07:30'},
                  {id: '7', slotMasterId: '10', slot: '08:00'},
                  {id: '8', slotMasterId: '10', slot: '08:30'},
                  {id: '9', slotMasterId: '11', slot: '09:00'},
                  {id: '10', slotMasterId: '11', slot: '09:30'},
                  {id: '11', slotMasterId: '12', slot: '10:00'},
                  {id: '12', slotMasterId: '12', slot: '10:30'},
                  {id: '13', slotMasterId: '13', slot: '11:00'},
                  {id: '14', slotMasterId: '13', slot: '11:30'}
                ]}
                isOpen={currentDropdown === 1}
                openSelect={() => openSelectDropdown(1)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={afterB}
                set_selectedOption={set_afterB}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>Before Lunch</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '3', slotMasterId: '8', slot: '12:00'},
                  {id: '4', slotMasterId: '8', slot: '12:30'},
                  {id: '5', slotMasterId: '9', slot: '13:00'},
                  {id: '6', slotMasterId: '9', slot: '13:30'},
                  {id: '7', slotMasterId: '10', slot: '14:00'},
                  {id: '8', slotMasterId: '10', slot: '14:30'},
                  {id: '9', slotMasterId: '11', slot: '15:00'},
                  {id: '10', slotMasterId: '11', slot: '15:30'}
                ]}
                isOpen={currentDropdown === 2}
                openSelect={() => openSelectDropdown(2)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={beforeL}
                set_selectedOption={set_beforeL}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>After Lunch</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '3', slotMasterId: '8', slot: '12:00'},
                  {id: '4', slotMasterId: '8', slot: '12:30'},
                  {id: '5', slotMasterId: '9', slot: '13:00'},
                  {id: '6', slotMasterId: '9', slot: '13:30'},
                  {id: '7', slotMasterId: '10', slot: '14:00'},
                  {id: '8', slotMasterId: '10', slot: '14:30'},
                  {id: '9', slotMasterId: '11', slot: '15:00'},
                  {id: '10', slotMasterId: '11', slot: '15:30'},
                  {id: '11', slotMasterId: '12', slot: '16:00'}
                ]}
                isOpen={currentDropdown === 3}
                openSelect={() => openSelectDropdown(3)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={afterL}
                set_selectedOption={set_afterL}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>Before Dinner</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '3', slotMasterId: '8', slot: '16:30'},
                  {id: '5', slotMasterId: '9', slot: '17:00'},
                  {id: '6', slotMasterId: '10', slot: '17:30'},
                  {id: '7', slotMasterId: '11', slot: '18:00'},
                  {id: '8', slotMasterId: '12', slot: '18:30'},
                  {id: '9', slotMasterId: '13', slot: '19:00'},
                  {id: '10', slotMasterId: '14', slot: '19:30'},
                  {id: '11', slotMasterId: '15', slot: '20:00'},
                  {id: '12', slotMasterId: '16', slot: '20:30'},
                  {id: '11', slotMasterId: '17', slot: '21:00'}
                ]}
                isOpen={currentDropdown === 4}
                openSelect={() => openSelectDropdown(4)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={beforeD}
                set_selectedOption={set_beforeD}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 17}}>After Dinner</Text>
              <AppSelectInput
                aspect_ratio={0.31}
                width={180}
                data={[
                  {id: '7', slotMasterId: '11', slot: '18:00'},
                  {id: '8', slotMasterId: '12', slot: '18:30'},
                  {id: '9', slotMasterId: '13', slot: '19:00'},
                  {id: '10', slotMasterId: '14', slot: '19:30'},
                  {id: '11', slotMasterId: '15', slot: '20:00'},
                  {id: '12', slotMasterId: '16', slot: '20:30'},
                  {id: '13', slotMasterId: '17', slot: '21:00'},
                  {id: '14', slotMasterId: '18', slot: '21:30'},
                  {id: '15', slotMasterId: '19', slot: '22:00'},
                  {id: '16', slotMasterId: '20', slot: '22:30'},
                  {id: '17', slotMasterId: '21', slot: '23:00'}
                ]}
                isOpen={currentDropdown === 5}
                openSelect={() => openSelectDropdown(5)}
                closeSelect={() => closeSelectDropdown(6)}
                optionLabel={'slot'}
                selectedOption={afterD}
                set_selectedOption={set_afterD}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.7}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10}}>
              <AppButtonPrimary
                      btTitle="START REMINDERS"
                      width={responsiveWidth(100) * 0.5}
                      aspect_ratio={0.32}
                      shadowRadius={2}
                      borderRadius={5}
                      textSize={responsiveFontSize(1.8)}
                      gradientBorderWidth={2}
                      btPress={setReminder}
                  />
            </View>
          </View>
        </Modal>
      </ScreenScrollable>
    </View>
  );
}

const AddedMedicine = ({med, index}) => {
  const med_image = require('../assets/images/capsules.png');

  return (
    <>
      <Text>
        {index > 0 ? <DividerX style={{marginVertical: 22}} /> : null}
      </Text>
      <View>
        <View style={[styles.med_row, {marginBottom: 15}]}>
          <View style={styles.med_col_1}>
            <AutoHeightImage
              width={responsiveWidth(100) * 0.1}
              source={med_image}
            />
          </View>
          <View style={styles.med_col_2}>
            <Text style={styles.med_name}>{med.medicineName}</Text>
          </View>
        </View>
        <View>
          <View style={styles.med_row}>
            <View style={styles.med_col_1}></View>
            <View style={styles.med_schedule}>
              <ScheduleItem
                text={`${PERIOD_MAPPING[med.frequency]} for next ${
                  med.period_value
                } ${med.period}`}
                image={IMG_SCHEDULE}
              />
              <ScheduleItem text={med.interval_time} image={IMG_INTERVAL} />
              {Object.keys(med.intervalSession)
                .filter((key) => med.intervalSession[key])
                .map((key, index) => {
                  return (
                    <ScheduleItem
                      key={'sch-item-' + index}
                      text={med.intervalSession[key]}
                      index={index}
                      image={ICON_MAPPING[key]}
                    />
                  );
                })}
                {/* <AppButtonSecondary
                  btTitle={'SET ALERT'}
                  width={responsiveWidth(150) * 0.16}
                  aspect_ratio={0.20}
                  shadowRadius={3}
                  borderRadius={5}
                  btPress={() => {
                    console.log("SCHEDULED ALERT BUTTON PRESSED!");
                    ReminderAlerts.scheduleAlert();
                  }}
                /> */}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const ScheduleItem = ({index, text, image}) => {
  return (
    <View style={styles.med_sch_item}>
      <AutoHeightImage width={responsiveWidth(100) * 0.045} source={image} />
      <Text style={styles.med_sch_text}>{text}</Text>
    </View>
  );
};

const HealthTipsCard = () => (
  <AppPanelBasicPlus
    style={{
      backgroundColor: '#FFD1D1',
      padding: 13,
      borderRadius: 11,
    }}
    withBorder={true}
    borderWidth={5}
    borderColor={'#F9E7E7'}
    img_section_width={'33%'}
    img_width={responsiveWidth(100) * 0.2}
    image={require('../assets/images/fruit_apple.png')}
    txt_section_width={'67%'}
    txt_section={
      <>
        <Text style={GetTextStyle('#333333', 1.5, 'bold')}>Food Habits</Text>
        <Text style={[GetTextStyle('#E85757', 2, 'bold')]}>
          Eat Healthy Be Healthy
        </Text>
        <Text style={GetTextStyle(undefined, 1.5)}>
          Eating Healthy Foods May Be More Important Than How Much You Weight
        </Text>
      </>
    }
    button_element={
      <AppButtonBasic
        btTitle="Share Now"
        fontSize={responsiveFontSize(1.2)}
        backgroundColor={'#FF7A7A'}
        color={'#FFFFFF'}
        borderRadius={3}
        style={{
          paddingVertical: 3,
          paddingHorizontal: 7,
          marginTop: 5,
        }}
        btPress={ToComePopup}
      />
    }
  />
);

function openDocument(document, appointmentId, setIsLoading) {
  setIsLoading(true);
  const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${document.fileExtension}`;
  const options = {
    fromUrl: getFullUrl(document.uri, 'appointments/' + appointmentId + '/'),
    toFile: localFile,
  };
  RNFS.downloadFile(options)
    .promise.then(() => FileViewer.open(localFile, {showOpenWithDialog: true}))
    .then(() => {
      console.log('file is viewed successfully...');
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('File view error______ : ', error);
      setIsLoading(false);
    });
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 30,
    backgroundColor: AppStyles.colors.lightgrey,
    flex: 1,
  },
  scrollContainer: {},
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  headingText: {
    fontSize: responsiveFontSize(2.4),
    marginBottom: 20,
  },
  header: {
    ...GetTextStyle(undefined, 2.1, 'bold', 'center'),
    marginBottom: 5,
  },
  btn_group: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  sub_header: (marginBottom = 5) => ({
    ...GetTextStyle('#888888', 1.6, undefined, 'center'),
    marginBottom,
  }),
  rx_text: {
    ...GetTextStyle(undefined, 2.8, 'bold', 'center'),
    marginBottom: 20,
  },
  section: (marginBottom = 20) => ({
    width: '100%',
    marginBottom,
  }),
  section_heading: (marginBottom = 5) => ({
    ...GetTextStyle('#333333', 1.8, 'bold'),
    marginBottom,
  }),
  section_para: {
    ...GetTextStyle('#888888', 1.8),
    marginBottom: 5,
  },
  med_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  med_col_1: {
    flexBasis: '10%',
  },
  med_col_2: {
    flexBasis: '90%',
    paddingLeft: 10,
  },
  med_name: {
    ...GetTextStyle('#333333', 1.8, 'bold'),
  },
  med_schedule: {},
  med_sch_item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  med_sch_text: {
    ...GetTextStyle('#888888', 1.8),
    marginLeft: 11,
  },
});
