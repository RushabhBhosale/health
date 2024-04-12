import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import moment from 'moment';
import HTML from 'react-native-render-html';
import AppointmentDetailSection from '../components/AppointmentDetailSection';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppPanelBasicPlus from '../components/AppPanelBasicPlus';
import AppHeading from '../components/AppHeading';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonBasic from '../components/AppButtonBasic';
import AppModalBottomUp from '../components/AppModalBottomUp';
import {DividerX} from '../components/AppCommonComponents';
import {ToComePopup} from '../utility/alert-boxes';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {Day_dd_Mon, makeFullName, isUTCDatePast} from '../config/functions';
import appointmentApi from '../api/appointment';
import blockApi from '../api/block';
import notificationApi from '../api/notification';
import crPolicyApi from '../api/cancelRefundPolicy';
import feedbackApi from '../api/appointmentFeedback';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import {USER_NOTES} from './DoctorsData';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;
const ICON_ANY = require('../assets/images/doc_prescription.png');
const MAX_MINUTES = 1440;

export default function AppointmentDetailScreen({route, navigation}) {
  const APNT_TYPE = {
    Confirmed: false,
    Completed: false,
    Cancelled: false,
    Rescheduled: false,
    Missed: false,
    'Doctor Dialed': false,
    Past: false,
  };

  const ref_bottomPopup = useRef();
  const ref_policyPopup = useRef();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectRefund, set_isDirectRefund] = useState(false);
  const [CancelFees, set_CancelFees] = useState();
  const [appointment, set_appointment] = useState(null);
  const [apntUpdated, set_apntUpdated] = useState(false);
  const [policyData, set_policyData] = useState();
  const [feedback, set_feedback] = useState();

  let IS_PAST,
    IS_READY,
    doc_id,
    doc_avtar,
    doc_name,
    doc_degree,
    doc_specialty,
    doc_experience,
    doc_distance,
    consult_happening,
    consult_name,
    consult_icon,
    consult_offline = false,
    consult_clinic = null;
  let Section_Data = null;

  function resetStates() {
    setError('');
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      set_appointment(route?.params?.detail);
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (appointment?._id) {
      getPolicyById();
      getAppointmentFeedback();
    }
  }, [appointment]);

  if (appointment) {
    if (appointment.is_past === undefined) {
      if (
        appointment.appointmentStatus === 'Completed' ||
        appointment.appointmentStatus === 'Cancelled' ||
        appointment.appointmentStatus === 'Doctor Dialed' ||
        appointment.appointmentStatus === 'Missed'
      ) {
        appointment.is_past = true;
      } else if (
        isUTCDatePast(new Date(appointment.appointmentDate), -15 * 60 * 1000)
      ) {
        appointment.is_past = true;
        if (appointment.appointmentStatus === 'Confirmed') {
          appointment.appointmentStatus = 'Past';
        }
      } else {
        appointment.is_past = false;
      }
      set_apntUpdated(!apntUpdated);
    }
    if (
      !appointment.is_past &&
      isUTCDatePast(new Date(appointment.appointmentDate), 15 * 60 * 1000)
    ) {
      IS_READY = true;
    }
    IS_PAST = appointment.is_past;
    APNT_TYPE[appointment?.appointmentStatus] = true;
    doc_id = appointment?.doctorId;
    doc_avtar = appointment?.doctorData?.avtar;
    doc_name = makeFullName(
      appointment?.doctorData.firstName,
      appointment?.doctorData.lastName,
      'Dr.',
    );
    doc_degree =
      appointment?.doctorData?.education &&
      appointment?.doctorData?.education[0]?.highestQualification;
    doc_specialty = appointment?.doctorData?.speciality?.title;
    doc_experience = (appointment?.doctorData?.experience || 0) + ' years exp.';
    doc_distance = (appointment?.doctorData?.distance || 0) + ' kms';
    consult_happening = appointment?.is_firstVisit
      ? 'First Time'
      : 'As Follow-up';
    consult_name =
      appointment?.consultTypeName === 'Video' ? 'Video' : 'Clinic';
    consult_icon =
      appointment.consultTypeName === 'Video'
        ? require('../assets/images/icon_video.png')
        : require('../assets/images/icon_building.png');
    if (appointment?.consultTypeName != 'Video') {
      consult_offline = true;
      if (appointment?.doctorData?.clinic?.length && appointment?.clinic_id) {
        consult_clinic = appointment.doctorData.clinic.find((cln) =>
          cln.fmcId
            ? cln.fmcId === appointment.clinic_id
            : cln._id === appointment.clinic_id,
        );
      }
    }

    // Prepare data for common section
    Section_Data = {
      doc_id,
      doc_avtar,
      doc_name,
      doc_fName: appointment?.doctorData.firstName,
      doc_lName: appointment?.doctorData.lastName,
      doc_specialty,
      doc_experience,
      doc_distance,
      doc_degree,
      consult_happening,
      consult_icon,
      consultation_type: appointment.consultTypeName,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
    };
  }

  /* Async api calls */
  const getPolicyById = async () => {
    try {
      setIsLoading(true);
      const resp = await crPolicyApi.getCRPolicyById(
        appointment.cancelRefundPolicy,
      );
      if (resp?.ok) {
        if (resp?.data?._id) set_policyData(resp.data);
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching Cancel-Refund Policy',
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching Cancel-Refund Policy', error);
      setError(error);
    }
  };

  const getAppointmentFeedback = async () => {
    try {
      setIsLoading(true);
      const resp = await feedbackApi.getAppointmentFeedback(appointment._id);
      if (resp?.ok) {
        if (resp?.data?._id) set_feedback(resp.data);
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching Feedback by Appointment',
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching Feedback by Appointment', error);
      setError(error);
    }
  };

  const prescriptionPressed = () =>
    navigation.navigate('PrescriptionDetail', {
      APPOINTMENT: appointment,
    });

  const handleReschedule = async () => {
    navigation.navigate('Doctor', {
      IS_RESCHEDULE: true,
      appointment: appointment,
      DoctorId: appointment.doctorId,
    });
  };

  const cancelConfirm = (isRefund = false) => {
    set_isDirectRefund(isRefund);
    const refund_amt = appointment.amount;
    const minutesLeft = moment(appointment.appointmentDate).diff(
      moment(),
      'minutes',
    );
    set_CancelFees(
      !isRefund ? (minutesLeft < MAX_MINUTES ? 0 : refund_amt) : refund_amt,
    );
    ref_bottomPopup.current.open();
  };

  const cancelBooking = async () => {
    const blockResponse = await blockApi.unblockblock(
      appointment.appointmentSlotId,
    );
    if (blockResponse.ok && blockResponse.data) {
      let update_payload = {
        cancelInitiatedBy: appointment?.cancelInitiatedBy
          ? appointment?.cancelInitiatedBy
          : 'Patient',
        cancelDate: moment().toDate(),
      };
      const updateAppointmentResponse = await appointmentApi.patchAppointment(
        update_payload,
        appointment._id,
      );
      if (updateAppointmentResponse?.ok && updateAppointmentResponse?.data) {
        const appointmentResponse = await appointmentApi.cancelAppointment(
          appointment._id,
        );
        if (appointmentResponse?.ok && appointmentResponse?.data) {
          const appointmentInfo = appointment;
          const appointmentDate = moment
            .utc(appointmentInfo?.appointmentDate)
            .format('dddd, MMMM Do YYYY');

          const patientName = makeFullName(
            appointmentInfo?.userData?.firstName,
            appointmentInfo?.userData?.lastName,
          );

          const doctorName = makeFullName(
            appointmentInfo?.doctorData?.firstName,
            appointmentInfo?.doctorData?.lastName,
            'Dr.',
          );

          const notiObj = {
            noteFor: 'Doctor',
            noteType: 'Appointment',
            noteData: {
              appointment: appointmentInfo._id,
            },
            title: `Dear doctor, your appointment with patient, ${patientName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime} is cancelled on Patient Request`,
            userId: appointmentInfo.doctorId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
          };

          const notificationResponse = await notificationApi.postNotification(
            notiObj,
          );
          if (!notificationResponse?.ok)
            setError(
              notificationResponse?.data?.errors?.[0]?.msg ||
                'Error in posting a Notification',
            );

          const cancelPayload = {
            noteFor: 'Patient',
            noteType: 'Appointment',
            noteData: {
              appointment: appointmentInfo._id,
            },
            title: `Dear patient, your appointment with a doctor, ${doctorName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime} has been cancelled by you.`,
            userId: appointmentInfo.userId,
            patient: appointmentInfo?.userId,
            doctor: appointmentInfo?.doctorId,
          };

          const noteResp = await notificationApi.postNotification(
            cancelPayload,
          );
          if (!noteResp?.ok)
            setError(
              noteResp?.data?.errors?.[0]?.msg ||
                'Error in posting Notification',
            );

          const adminNotiObj = {
            noteFor: 'Admin',
            noteType: 'Appointment',
            title: `Dear admin, the appointment on ${appointmentDate} at ${appointmentInfo?.appointmentTime} of ${patientName} with ${doctorName} is cancelled on Patient Request`,
            userId: config.hnAdminId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
            noteData: {
              appointment: appointmentInfo._id,
            },
          };

          const adminNotificationResponse =
            await notificationApi.postAdminNotification(adminNotiObj);
          if (!adminNotificationResponse?.ok)
            setError(
              adminNotificationResponse?.data?.errors?.[0]?.msg ||
                'Error in posting Admin Notification',
            );
          navigation.navigate('Appointment');
        } else {
          setError(
            appointmentResponse?.data?.errors?.[0]?.msg ||
              appointmentResponse?.problem ||
              'Error in Canceling an Appointment',
          );
        }
      } else {
        setError(
          updateAppointmentResponse?.data?.errors?.[0]?.msg ||
            'Error in updating Appointment CancelInitiatedBy status',
        );
      }
    } else {
      setError(
        blockResponse?.data?.errors?.[0]?.msg ||
          blockResponse?.problem ||
          'Error in Unblocking a Block.',
      );
    }
  };

  const directRefund = async () => {
    const blockResponse = await blockApi.unblockblock(
      appointment.appointmentSlotId,
    );
    if (blockResponse.ok && blockResponse.data) {
      let update_payload = {
        cancelInitiatedBy: appointment?.cancelInitiatedBy
          ? appointment?.cancelInitiatedBy
          : 'Patient',
        cancelDate: moment().toDate(),
      };
      const updateAppointmentResponse = await appointmentApi.patchAppointment(
        update_payload,
        appointment._id,
      );
      if (updateAppointmentResponse?.ok && updateAppointmentResponse?.data) {
        const appointmentResponse = await appointmentApi.refundAppointment(
          appointment._id,
        );
        if (appointmentResponse?.ok && appointmentResponse?.data) {
          const appointmentInfo = appointment;
          const appointmentDate = moment
            .utc(appointmentInfo?.appointmentDate)
            .format('dddd, MMMM Do YYYY');

          const patientName = makeFullName(
            appointmentInfo?.userData?.firstName,
            appointmentInfo?.userData?.lastName,
          );

          const doctorName = makeFullName(
            appointmentInfo?.doctorData?.firstName,
            appointmentInfo?.doctorData?.lastName,
            'Dr.',
          );

          const notiObj = {
            noteFor: 'Doctor',
            noteType: 'Appointment',
            noteData: {
              appointment: appointmentInfo._id,
            },
            title: `Dear doctor, your appointment with patient, ${patientName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime} is cancelled on Patient Request`,
            userId: appointmentInfo.doctorId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
          };

          const notificationResponse = await notificationApi.postNotification(
            notiObj,
          );
          if (!notificationResponse?.ok)
            setError(
              notificationResponse?.data?.errors?.[0]?.msg ||
                'Error in posting a Notification',
            );

          const cancelPayload = {
            noteFor: 'Patient',
            noteType: 'Appointment',
            noteData: {
              appointment: appointmentInfo._id,
            },
            title: `Dear patient, your appointment with a doctor, ${doctorName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime} has been cancelled and the refund is processed.`,
            userId: appointmentInfo.userId,
            patient: appointmentInfo?.userId,
            doctor: appointmentInfo?.doctorId,
          };

          const noteResp = await notificationApi.postNotification(
            cancelPayload,
          );
          if (!noteResp?.ok)
            setError(
              noteResp?.data?.errors?.[0]?.msg ||
                'Error in posting Notification',
            );

          const adminNotiObj = {
            noteFor: 'Admin',
            noteType: 'Appointment',
            title: `Dear admin, the appointment on ${appointmentDate} at ${appointmentInfo?.appointmentTime} of ${patientName} with ${doctorName} is cancelled on Patient Request and the Refund is Processed.`,
            userId: config.hnAdminId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
            noteData: {
              appointment: appointmentInfo._id,
            },
          };

          const adminNotificationResponse =
            await notificationApi.postAdminNotification(adminNotiObj);
          if (!adminNotificationResponse?.ok)
            setError(
              adminNotificationResponse?.data?.errors?.[0]?.msg ||
                'Error in posting Admin Notification',
            );
          navigation.navigate('Appointment');
        } else {
          setError(
            appointmentResponse?.data?.errors?.[0]?.msg ||
              appointmentResponse?.problem ||
              'Error in Canceling an Appointment',
          );
        }
      } else {
        setError(
          updateAppointmentResponse?.data?.errors?.[0]?.msg ||
            'Error in updating Appointment CancelInitiatedBy status',
        );
      }
    } else {
      setError(
        blockResponse?.data?.errors?.[0]?.msg ||
          blockResponse?.problem ||
          'Error in Unblocking a Block.',
      );
    }
  };

  return appointment ? (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <LoadingIndicator visible={isLoading} />
        <View style={styles.content}>
          <View style={styles.header}>
            {APNT_TYPE.Completed ? (
              <AppHeading
                style={GetTextStyle('#64AA0C', 2.6, 'bold', 'center')}>
                Appointment is{'\n'}Completed
              </AppHeading>
            ) : APNT_TYPE.Cancelled ? (
              <AppHeading
                style={GetTextStyle('#9F0606', 2.6, 'bold', 'center')}>
                Appointment{'\n'}Cancelled
              </AppHeading>
            ) : APNT_TYPE.Past ||
              APNT_TYPE.Missed ||
              APNT_TYPE['Doctor Dialed'] ? (
              <AppHeading
                style={GetTextStyle('#9F0606', 2.6, 'bold', 'center')}>
                Appointment is{'\n'}Missed
              </AppHeading>
            ) : APNT_TYPE.Rescheduled ? (
              <AppHeading
                style={GetTextStyle('#BC8001', 2.6, 'bold', 'center')}>
                Appointment{'\n'}Rescheduled
              </AppHeading>
            ) : (
              <AppHeading
                style={GetTextStyle(undefined, 2.6, 'bold', 'center')}>
                Appointment{'\n'}Confirmed
              </AppHeading>
            )}
          </View>

          <AppointmentDetailSection
            data={Section_Data}
            style_wrap={{marginBottom: 20}}
          />

          {consult_offline && consult_clinic ? (
            <View style={{marginBottom: 35}}>
              <View style={styles.clinic_content}>
                <Text style={styles.clinic_name}>
                  {consult_clinic?.clinicName}
                </Text>
                <Text style={styles.clinic_address}>
                  {consult_clinic?.clinicAddress
                    ? `${consult_clinic?.clinicAddress}, `
                    : null}
                </Text>
                <Text style={styles.clinic_address}>
                  {consult_clinic?.clinicCity
                    ? `${consult_clinic.clinicCity}, `
                    : null}
                  {consult_clinic?.clinicState
                    ? `${consult_clinic.clinicState}, `
                    : null}
                  {consult_clinic?.clinicPincode
                    ? `${consult_clinic.clinicPincode}`
                    : null}
                </Text>
              </View>
            </View>
          ) : null}

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          {IS_PAST && (
            <View style={{marginBottom: 35}}>
              <Text style={styles.sub_title}>Notes Added by Patient</Text>
              <AppBoxShadowInner
                aspect_ratio={0.27}
                content_style={{padding: 15}}>
                <Text style={GetTextStyle(undefined, 1.9)}>
                  {appointment.user_notes}
                </Text>
              </AppBoxShadowInner>
            </View>
          )}

          {!IS_PAST && (
            <>
              <View
                style={{
                  flexShrink: 1,
                  width: '60%',
                  alignSelf: 'center',
                }}>
                <Text style={GetTextStyle(undefined, 1.8, undefined, 'center')}>
                  {appointment.user_notes}
                </Text>
              </View>

              <View style={{flex: 1, marginBottom: 35, marginRight: 20}}>
                {USER_NOTES?.length &&
                  USER_NOTES.map((item, index) => (
                    <ListItem
                      key={'list-item-' + index}
                      item={item}
                      index={index}
                      totalItems={USER_NOTES.length}
                    />
                  ))}
              </View>
            </>
          )}

          {APNT_TYPE.Completed &&
          (appointment.is_prescription_available ||
            appointment.prescriptionStatus === 'available') ? (
            <View style={{marginBottom: 35}}>
              <Text style={styles.sub_title}>Prescription Added by Doctor</Text>
              <AppPanelBasicPlus
                style={{padding: 13, borderRadius: 11}}
                img_section_width={'27%'}
                img_width={responsiveWidth(100) * 0.15}
                image={ICON_ANY}
                image_pressed={prescriptionPressed}
                txt_section_width={'73%'}
                txt_section={
                  <>
                    <TouchableWithoutFeedback onPress={prescriptionPressed}>
                      <Text style={GetTextStyle('#333333', 2, 'bold')}>
                        Prescription By Doctor
                      </Text>
                    </TouchableWithoutFeedback>
                    <Text
                      style={[GetTextStyle('#888888', 1.7), {marginBottom: 3}]}>
                      By, {doc_name}
                    </Text>
                    <Text style={GetTextStyle(undefined, 1.7)}>
                      {consult_name} Consultation, {consult_happening},{' '}
                      {Day_dd_Mon(new Date(Section_Data.date))},{' '}
                      {Section_Data.time}
                    </Text>
                  </>
                }
              />
            </View>
          ) : null}

          {APNT_TYPE.Completed ? (
            <View style={{flexShrink: 1, marginBottom: 33}}>
              <AppButtonPrimary
                btTitle={'SCHEDULE FOLLOW UP'}
                width={responsiveWidth(100) * 0.6}
                aspect_ratio={0.22}
                style={styles.btn_submit}
                btPress={() =>
                  navigation.navigate('Doctor', {
                    DoctorId: appointment.doctorId,
                  })
                }
              />
              {!feedback?._id ? (
                <AppButtonSecondary
                  btTitle={'PROVIDE FEEDBACK'}
                  width={responsiveWidth(100) * 0.4}
                  aspect_ratio={0.2}
                  shadowRadius={2}
                  borderRadius={4}
                  btPress={() =>
                    navigation.navigate('AppointmentFeedback', {
                      AppointmentId: appointment._id,
                    })
                  }
                  style={{alignSelf: 'center'}}
                />
              ) : null}
            </View>
          ) : APNT_TYPE.Cancelled ||
            APNT_TYPE.Missed ||
            APNT_TYPE['Doctor Dialed'] ? (
            <AppButtonPrimary
              btTitle={'REBOOK NOW'}
              width={responsiveWidth(100) * 0.59}
              aspect_ratio={0.22}
              style={{alignSelf: 'center'}}
              btPress={() =>
                navigation.navigate('Doctor', {
                  DoctorId: appointment.doctorId,
                })
              }
            />
          ) : APNT_TYPE.Past ? (
            <AppButtonPrimary
              btTitle={'REFUND'}
              width={responsiveWidth(100) * 0.4}
              aspect_ratio={0.28}
              style={{alignSelf: 'center'}}
              btPress={() => cancelConfirm(true)}
            />
          ) : (
            <View style={{flexShrink: 1, marginBottom: 50}}>
              {/* <AppButtonPrimary
                btTitle={'RESCHEDULE'}
                width={responsiveWidth(100) * 0.56}
                aspect_ratio={0.22}
                style={styles.btn_submit}
                btPress={handleReschedule}
              /> */}
              <AppButtonSecondary
                isDisabled={IS_READY}
                titleClr_disabled={'#ffffff'}
                btTitle={'CANCEL BOOKING'}
                width={responsiveWidth(100) * 0.33}
                aspect_ratio={0.2}
                shadowRadius={2}
                borderRadius={4}
                btPress={() => cancelConfirm(false)}
                style={{alignSelf: 'center'}}
              />
            </View>
          )}

          {/* {IS_PAST && (
            <AppPanelBasicPlus
              style={{
                backgroundColor: '#FFD1D1',
                padding: 13,
                borderRadius: 11,
                marginBottom: 50,
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
                  <Text style={GetTextStyle('#333333', 1.5, 'bold')}>
                    Food Habits
                  </Text>
                  <Text style={[GetTextStyle('#E85757', 2, 'bold')]}>
                    Eat Healthy Be Healthy
                  </Text>
                  <Text style={GetTextStyle(undefined, 1.5)}>
                    Eating Healthy Foods May Be More Important Than How Much You
                    Weight
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
                  btPress={ToComePopup}
                  style={{
                    paddingVertical: 3,
                    paddingHorizontal: 7,
                    marginTop: 5,
                  }}
                />
              }
            />
          )} */}
        </View>
      </ScrollView>

      <AppModalBottomUp ref={ref_bottomPopup} height={270}>
        <View style={{marginBottom: 18}}>
          <Text
            style={[
              GetTextStyle(undefined, 2.2, undefined, 'center'),
              {marginBottom: 5},
            ]}>
            Refund of{' '}
            <Text style={GetTextStyle('#CF3D3D', 2.2, 'bold')}>
              Rs. {CancelFees}
            </Text>
          </Text>
          <Text style={GetTextStyle(undefined, 1.6, undefined, 'center')}>
            You will be refunded Rs. {CancelFees} on cancellation
          </Text>
        </View>

        <View style={{width: '75%', alignSelf: 'center', marginBottom: 25}}>
          <Text
            style={[
              GetTextStyle(undefined, 1.6, undefined, 'center'),
              {lineHeight: 18},
            ]}>
            By clicking cancel booking you acknowledge to cancel your
            appointment. Read the cancellation policy{' '}
            <TouchableWithoutFeedback
              onPress={() => ref_policyPopup.current.open()}>
              <Text style={styles.link_text}>click here</Text>
            </TouchableWithoutFeedback>
          </Text>
        </View>

        <AppButtonPrimary
          width={responsiveWidth(100) * 0.6}
          btTitle={'CANCEL BOOKING'}
          aspect_ratio={0.21}
          gradientColorArray={['#CF3D3D', '#CF3D3D']}
          style={{alignSelf: 'center'}}
          btPress={() => {
            ref_bottomPopup.current.close();
            isDirectRefund ? cancelBooking() : directRefund();
            set_isDirectRefund(false);
          }}
        />
      </AppModalBottomUp>

      <AppModalBottomUp
        ref={ref_policyPopup}
        closeOnDragDown={false}
        height={responsiveHeight(100) - 100}
        closeButton={false}
        style_content={{flex: 1}}>
        {policyData?.title ? (
          <Text style={styles.policy_title}>{policyData.title}</Text>
        ) : null}

        <ScrollView style={styles.policy_scroll}>
          {policyData?.content ? (
            <HTML source={{html: policyData.content}} />
          ) : (
            <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
              No Policy Found
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
          btPress={() => ref_policyPopup.current.close()}
          style={{alignSelf: 'center'}}
        />
      </AppModalBottomUp>
    </View>
  ) : (
    <View>
      <Text>Fetching...</Text>
    </View>
  );
}

const ListItem = ({item, index, totalItems}) => (
  <View>
    <DividerX style={{marginVertical: 15}} />
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image
        source={require('../assets/images/icon_checked.png')}
        style={styles.check_item_img}
      />
      <Text style={GetTextStyle(undefined, 1.85)}>{item.title}</Text>
    </View>
    {index + 1 === totalItems && <DividerX style={{marginVertical: 15}} />}
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    paddingTop: 5,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    width: WIDTH,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    flexShrink: 1,
    alignItems: 'center',
    marginBottom: 25,
  },
  sub_title: {
    ...GetTextStyle(undefined, 1.75, 'bold'),
    marginBottom: 12,
  },
  clinic_content: {
    flex: 1,
    alignItems: 'center',
  },
  clinic_name: {
    ...GetTextStyle('#888888', 1.8, 'bold'),
  },
  clinic_address: {
    ...GetTextStyle('#888888', 1.5),
  },
  check_item_img: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 16,
  },
  btn_submit: {
    alignSelf: 'center',
    marginBottom: 22,
  },
  link_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 1.5),
    textDecorationLine: 'underline',
  },
  policy_title: {
    ...GetTextStyle(undefined, 2.2, 'bold'),
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  policy_scroll: {
    width: responsiveWidth(100),
    alignSelf: 'center',
    paddingHorizontal: (responsiveWidth(100) - WIDTH) / 2,
  },
});
