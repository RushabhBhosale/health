import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import AppBoxShadow from '../components/AppBoxShadow';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppHeading from '../components/AppHeading';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import Document_Tab from '../components/Document_Tab';
import Profile_Tab from '../components/Profile_Tab';
import Settings_Tab from '../components/Settings_Tab';
import {ThumbPlaceholder} from '../components/AppCommonComponents';
import {age_from_dob, makeFullName, getFullUrl} from '../config/functions';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import useAuth from '../auth/useAuth';
import AuthContext from '../auth/context';
import documentApi from '../api/documents';
import doctorDocApi from '../api/doctorDoc';
import prescriptionApi from '../api/prescription';
import appointmentApi from '../api/appointment';
import doctorsApi from '../api/doctors';
import medInsuranceApi from '../api/medicalInsurance';
import flyMembersApi from '../api/familyMember';
import usersApi from '../api/users';
import { useTranslation } from 'react-i18next';

const WIDTH = Container_Width;
const THUMB_BORDER_RADIUS = 18;

export default function ProfileDetailScreen({navigation, route}) {
  const {t, i18n} = useTranslation();

  let ALL_DOCS = [
    {
      _id: 1,
      thumb: require('../assets/images/doc_prescription.png'),
      title: t('prescriptions'),
      count: 0,
      text: t('prescr_descr'),
      type: 'Prescription',
      docs: [],
    },
    {
      _id: 2,
      thumb: require('../assets/images/doc_research.png'),
      title: t('lab_reports'),
      count: 0,
      text: t('lab_reports_descr'),
      type: 'Lab Report',
      docs: [],
    },
    {
      _id: 3,
      thumb: require('../assets/images/doc_invoice.png'),
      title: t('payment_invoice'),
      count: 0,
      text: t('payment_invoice_descr'),
      type: 'Invoice',
      docs: [],
    },
  ];
  
  const auth = useAuth();
  const {user, setUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, set_activeTab] = useState(1);
  const [docList, set_docList] = useState(ALL_DOCS);
  const [patientDoctors, set_patientDoctors] = useState([]);
  const [medInsurances, set_medInsurances] = useState([]);
  const [flyMembers, set_flyMembers] = useState([]);
  const [userData, setUserData] = useState([]);

  function resetStates() {
    setError('');
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      resetStates();
      if (route?.params?.showTabActive) {
        const {showTabActive} = route?.params;
        set_activeTab(showTabActive);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let prescriptions = [],
      lab_reports = [],
      invoices = [];
    if(userData) {
      for (let i = 0; i < userData.length; i++) {
        userData[i].documentType === 'Prescription' ||
        userData[i].documentType === 'AppointmentPrescription'
          ? prescriptions.push(userData[i])
          : userData[i].documentType === 'Lab Report'
          ? lab_reports.push(userData[i])
          : invoices.push(userData[i]);
      }
    }
    set_docList([
      {
        _id: 1,
        thumb: require('../assets/images/doc_prescription.png'),
        title: t('prescriptions'),
        count: prescriptions.length,
        text: t('prescr_descr'),
        type: 'Prescription',
        docs: prescriptions,
      },
      {
        _id: 2,
        thumb: require('../assets/images/doc_research.png'),
        title: t('lab_reports'),
        count: lab_reports.length,
        text: t('lab_reports_descr'),
        type: 'Lab Report',
        docs: lab_reports,
      },
      {
        _id: 3,
        thumb: require('../assets/images/doc_invoice.png'),
        title: t('payment_invoice'),
        count: invoices.length,
        text: t('payment_invoice_descr'),
        type: 'Invoice',
        docs: invoices,
      },
    ]);
  }, [i18n.language]);

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      processDocuments([
        ...(await fetchUserDocs()),
        ...(await fetchUserDoctorDocs()),
        ...(await fetchPatientPrescriptions()),
        ...(await fetchUserAppointments()),
      ], true);
      fetchPatientDoctors();
      // fetchMedInsurances();
      fetchFamilyMembers();
    });
    return unsubscribe;
  }, []);

  /* Async api calls */
  const fetchUserDocs = async () => {
    let userDocs = [];
    setIsLoading(true);
    const resp = await documentApi.getDocuments(user._id);
    if (resp?.ok) {
      if (resp?.data?.length)
        userDocs = resp.data.map(
          (item) => ((item.uploadedBy = 'patient'), item),
        );
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching user documents',
      );
    }
    setIsLoading(false);
    return userDocs.map((item) => ((item.uploadedBy = 'patient'), item));
  };

  const fetchUserDoctorDocs = async () => {
    let userDoctorDocs = [];
    setIsLoading(true);
    const resp = await doctorDocApi.getPatientDocs(user._id);
    if (resp?.ok) {
      if (resp?.data?.length)
        userDoctorDocs = resp.data.map(
          (item) => ((item.uploadedBy = 'doctor'), item),
        );
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg ||
          'Error in fetching user documents uploaded by doctors',
      );
    }
    setIsLoading(false);
    return userDoctorDocs.map((item) => ((item.uploadedBy = 'doctor'), item));
  };

  const fetchPatientPrescriptions = async () => {
    let userPrescriptions = [];
    setIsLoading(true);
    const resp = await prescriptionApi.getPatientPrescriptions(user._id);
    if (resp?.ok) {
      if (resp?.data?.length)
        userPrescriptions = resp.data.map(
          (item) => ((item.documentType = 'AppointmentPrescription'), item),
        );
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Prescriptions',
      );
    }
    setIsLoading(false);
    return userPrescriptions;
  };

  const fetchUserAppointments = async () => {
    let userAppointments = [];
    setIsLoading(true);
    const resp = await appointmentApi.getCompletedAppointment(user._id);
    if (resp?.ok) {
      if (resp?.data?.length)
        userAppointments = resp.data.map(
          (item) => ((item.documentType = 'Appointment'), item),
        );
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Appointments',
      );
    }
    setIsLoading(false);
    return userAppointments;
  };

  const fetchPatientDoctors = async () => {
    setIsLoading(true);
    const resp = await doctorsApi.getDoctorsByPatient(user._id);
    if (resp?.ok) {
      if (resp?.data?.length) {
        set_patientDoctors(
          alterListObjects(resp.data, 'firstName', 'lastName'),
        );
      }
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Doctors list',
      );
    }
    setIsLoading(false);
  };

  function alterListObjects(inList) {
    return inList.map((item) => ({
      _id: item._id,
      fullName: makeFullName(item.firstName, item.lastName, 'Dr.'),
    }));
  }

  const fetchMedInsurances = async () => {
    setIsLoading(true);
    const resp = await medInsuranceApi.getUserInsurances(user._id);
    if (resp?.ok) {
      resp?.data?.length ? set_medInsurances(resp.data) : set_medInsurances([]);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching user insurances',
      );
    }
    setIsLoading(false);
  };

  const fetchFamilyMembers = async () => {
    setIsLoading(true);
    const resp = await flyMembersApi.getUserFlyMembers(user._id);
    if (resp?.ok) {
      resp?.data?.length ? set_flyMembers(resp.data) : set_flyMembers([]);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching user famliy members',
      );
    }
    setIsLoading(false);
  };

  /* Functions & Logic */
  function processDocuments(userDocs, reset=true) {
    if(reset) {
      setUserData(userDocs);
    }
    let prescriptions = [],
      lab_reports = [],
      invoices = [];
    for (let i = 0; i < userDocs.length; i++) {
      userDocs[i].documentType === 'Prescription' ||
      userDocs[i].documentType === 'AppointmentPrescription'
        ? prescriptions.push(userDocs[i])
        : userDocs[i].documentType === 'Lab Report'
        ? lab_reports.push(userDocs[i])
        : invoices.push(userDocs[i]);
    }
    set_docList(
      docList.map((item) => {
        if (item.type === 'Prescription') {
          item.docs = prescriptions;
          item.count = prescriptions.length;
        } else if (item.type === 'Lab Report') {
          item.docs = lab_reports;
          item.count = lab_reports.length;
        } else if (item.type === 'Invoice') {
          item.docs = invoices;
          item.count = invoices.length;
        } else item.docs = [];
        return item;
      }),
    );
  }

  const saveUser = async (payload) => {
    setIsLoading(true);
    try {
      const resp = await usersApi.register(payload, user.phone);
      if (resp?.ok) {
        if (resp?.data) {
          await auth.profile(resp.data);
        } else
          setError(resp?.data?.errors?.[0]?.msg || 'Error in updating User');
      } else {
        setError(resp?.data?.errors?.[0]?.msg || 'Error in updating User');
      }
    } catch (error) {
      console.error('Error in updating User : ', error);
      setError(error || 'Error in updating User');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.content}>
        <View style={styles.section}>
          <ProfileCard c_data={user} navigation={navigation} />
        </View>

        {error !== '' && (
          <View style={{flexShrink: 1}}>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.tab_panel}>
          <View style={styles.tab_head}>
            <AppButtonSecondary
              isPressed={activeTab === 1}
              btTitle={t('my_documents')}
              width={(12 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(1)}
            />
            <AppButtonSecondary
              isPressed={activeTab === 2}
              btTitle={t('profile')}
              width={(7 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(2)}
            />
            <AppButtonSecondary
              isPressed={activeTab === 3}
              btTitle={t('settings')}
              width={(8 + 2) * 0.02 * responsiveWidth(100)}
              height={responsiveWidth(100) * 0.064}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              style={{marginRight: 12}}
              btPress={() => set_activeTab(3)}
            />
          </View>

          <View style={styles.tab_body}>
            {activeTab === 1 ? (
              <Document_Tab
                tabData={docList}
                patientDoctors={patientDoctors}
                navigation={navigation}
              />
            ) : activeTab === 2 ? (
              <Profile_Tab
                tabData={user}
                navigation={navigation}
                medInsurances={medInsurances}
                flyMembers={flyMembers}
              />
            ) : (
              <Settings_Tab tabData={user} saveUser={saveUser} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const ProfileCard = ({c_data, navigation}) => {
  const {t, i18n} = useTranslation();

  const profile_image = getFullUrl(
    c_data?.avtar,
    'patients/' + c_data?._id + '/',
  );
  return (
    <View style={{flexShrink: 1}}>
      <AppBoxShadowInner
        aspect_ratio={170 / 297}
        content_style={AppStyles.centerXY}>
        <View style={styles.card}>
          <AppBoxShadow
            width={responsiveWidth(100) * 0.21}
            aspect_ratio={1 / 1}
            borderRadius={THUMB_BORDER_RADIUS}
            style={{marginBottom: 10}}>
            {profile_image ? (
              <Image style={styles.cd_thumb} source={{uri: profile_image}} />
            ) : (
              <ThumbPlaceholder
                fName={c_data?.firstName}
                lName={c_data?.lastName}
              />
            )}
          </AppBoxShadow> 
          <AppHeading style={styles.cd_title}>
            {c_data && makeFullName(c_data.firstName, c_data.lastName)}
          </AppHeading>
          <Text style={styles.cd_sub_text}>
            {t('age')} {age_from_dob(new Date(c_data?.dob))}
            {'  '}|{'  '}
            {t(c_data?.gender)}
            {'  '}|{'  '}
            {c_data?.bloodGroup}
          </Text>

          {/* <View style={styles.btn_group}>
            <View
              style={{
                flex: 1,
                paddingRight: 5,
              }}>
              <AppButtonPrimary
                btTitle={'BOOKMARK DOCUMENTS'}
                style={{alignSelf: 'flex-end'}}
                width={responsiveWidth(100) * 0.38}
                aspect_ratio={0.22}
                shadowRadius={2}
                borderRadius={5}
                textSize={responsiveFontSize(1.45)}
                gradientBorderWidth={2}
                btPress={() => console.log('BOOKMARK DOCUMENTS...')}
              />
            </View>
            <View
              style={{
                flex: 1,
                paddingLeft: 5,
              }}>
              <AppButtonSecondary
                btTitle={'UPLOAD DOCUMENTS'}
                style={{alignSelf: 'flex-start'}}
                width={responsiveWidth(100) * 0.38}
                aspect_ratio={0.22}
                shadowRadius={2}
                borderRadius={5}
                fontSize={responsiveFontSize(1.45)}
                btPress={() => navigation.navigate('DocumentUpload')}
              />
            </View>
          </View> */}
        </View>
      </AppBoxShadowInner>
    </View>
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
    marginBottom: 25,
  },
  card: {
    flex: 1,
    width: '90%',
    ...AppStyles.centerXY,
  },
  cd_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
  },
  cd_title: {
    ...GetTextStyle(undefined, 2.6, 'bold', 'center'),
    marginBottom: 3,
  },
  cd_sub_text: {
    ...GetTextStyle(undefined, 1.6, undefined, 'center'),
    // marginBottom: 9,
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
    marginBottom: 12,
  },
  tab_body: {
    flex: 1,
  },
});
