import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, ScrollView} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import AppointmentDetailSection from '../components/AppointmentDetailSection';
import AppHeading from '../components/AppHeading';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppRatings from '../components/AppRatings';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormButton from '../components/AppFormButton';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {makeFullName} from '../config/functions';
import appointmentApi from '../api/appointment';
import feedbackApi from '../api/appointmentFeedback';
import notificationApi from '../api/notification';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;

export default function AppointmentFeedbackScreen({route, navigation}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointment, set_appointment] = useState(null);
  const [fb_rating, set_fb_rating] = useState(1);
  let IS_PAST,
    doc_id,
    doc_avtar,
    doc_name,
    doc_degree,
    doc_specialty,
    doc_experience,
    doc_distance,
    consult_happening,
    consult_name,
    consult_icon;
  let Section_Data = null;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.AppointmentId)
        fetchAppointmentDetails(route.params.AppointmentId);
    });
    return unsubscribe;
  }, [route, route.params]);

  /* Async api calls */
  const fetchAppointmentDetails = async (apnt_id) => {
    if (apnt_id) {
      setIsLoading(true);
      const resp = await appointmentApi.getAppointmentById(apnt_id);
      if (resp?.ok) {
        if (resp?.data?._id) set_appointment(resp.data);
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in appointment details by id',
        );
      }
      setIsLoading(false);
    }
  };

  if (appointment) {
    IS_PAST = appointment.is_past;
    doc_id = appointment?.doctorId;
    doc_avtar = appointment?.doctorData?.avtar;
    doc_name = makeFullName(
      appointment?.doctorData?.firstName,
      appointment?.doctorData?.lastName,
      'Dr.',
    );
    doc_degree =
      appointment?.doctorData?.education &&
      appointment?.doctorData?.education[0]?.highestQualification;
    doc_specialty = appointment?.doctorData?.speciality?.title;
    doc_experience = (appointment?.doctorData?.experience || 0) + ' years exp.';
    doc_distance = (appointment?.doctorData?.distance || 0) + ' kms';
    consult_happening = appointment.is_firstVisit
      ? 'First Time'
      : 'As Follow-up';
    consult_name =
      appointment?.consultTypeName === 'Video' ? 'Video' : 'Clinic';
    consult_icon =
      appointment.consultTypeName === 'Video'
        ? require('../assets/images/icon_video.png')
        : require('../assets/images/icon_building.png');

    // Prepare data for common section
    Section_Data = {
      doc_id,
      doc_avtar,
      doc_name,
      doc_fName: appointment?.doctorData?.firstName,
      doc_lName: appointment?.doctorData?.lastName,
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

  /* Form */
  let FormDataObject = getFormData();

  function getFormData() {
    return {
      comments: '',
    };
  }

  const formDataSchema = Yup.object().shape({
    comments: Yup.string(),
  });

  const submitForm = async (data) => {
    setIsLoading(true);
    try {
      const payload = formateFormData(data);
      const resp = await feedbackApi.addFeedback(payload);
      if (resp?.ok) {
        if (resp?.data) {
          const adminNotiObj = {
            noteFor: 'Admin',
            noteType: 'Feedback',
            title: `Dear admin, a new review rating has been posted`,
            userId: config.hnAdminId,
            doctor: appointment?.doctorId,
            patient: appointment?.userId,
            noteData: {
              appointment: appointment._id,
            },
          };

          const adminNoteResp = await notificationApi.postAdminNotification(
            adminNotiObj,
          );
          navigation.navigate('Appointment');
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in submitting Feedback',
        );
      }
    } catch (error) {
      console.log('Appointment Feedback Saving Failed', error);
      setError('An unexpected Server Error occoured.');
    }
    setIsLoading(false);
  };

  function formateFormData(dataIn) {
    return {
      userId: appointment.userId,
      doctorId: appointment.doctorId,
      appointmentId: appointment._id,
      rating: fb_rating,
      comments: dataIn?.comments,
    };
  }

  return (
    <View style={{flex: 1}}>
      <LoadingIndicator visible={isLoading} />
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading style={GetTextStyle(undefined, 2.6, 'bold', 'center')}>
              Submit your{'\n'}Feedback
            </AppHeading>
          </View>

          {Section_Data ? (
            <AppointmentDetailSection data={Section_Data} />
          ) : null}

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <View>
            <AppForm
              initialValues={FormDataObject}
              validationSchema={formDataSchema}
              onSubmit={submitForm}>
              <Text
                style={[
                  GetTextStyle(undefined, 1.8, 'bold', 'center'),
                  {marginBottom: 11},
                ]}>
                Rate your Consultation
              </Text>

              <View style={{marginBottom: 30}}>
                <AppRatings rating={fb_rating} set_rating={set_fb_rating} />
              </View>

              <AppFormInput
                name="comments"
                keyboardType="default"
                placeholder={'Write your feedback here'}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                aspect_ratio={0.36}
                style={{fontSize: responsiveFontSize(2.2), marginBottom: 27}}
              />

              <View style={{flexShrink: 1, marginBottom: 50}}>
                <AppFormButton
                  btTitle={'SAVE FEEDBACK'}
                  width={responsiveWidth(100) * 0.6}
                  aspect_ratio={0.22}
                  style={styles.btn_submit}
                />
                <AppButtonSecondary
                  btTitle={'SKIP FOR NOW'}
                  width={responsiveWidth(100) * 0.33}
                  aspect_ratio={0.2}
                  shadowRadius={2}
                  borderRadius={4}
                  btPress={() => navigation.navigate('Appointment')}
                  style={{alignSelf: 'center'}}
                />
              </View>
            </AppForm>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    paddingTop: 20,
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
    marginBottom: 20,
  },
  sub_title: {
    ...GetTextStyle(undefined, 1.75, 'bold'),
    marginBottom: 12,
  },
  btn_submit: {
    alignSelf: 'center',
    marginBottom: 22,
  },
});
