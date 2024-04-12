import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import moment from 'moment';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppErrorMessage from '../components/AppErrorMessage';
import AppHeading from '../components/AppHeading';
import {DividerX} from '../components/AppCommonComponents';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import {Day_dd_Mon, makeFullName, age_from_dob} from '../config/functions';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import thyrocareApi from '../api/thyrocare';
import simiraApi from '../api/simira';
import pathologyApi from '../api/pathology';
import users from '../api/users';
import familyMember from '../api/familyMember';

const WIDTH = Container_Width;

export default function BookTestPaymentScreen({navigation, route}) {
  const {user, setUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bkData, set_bkData] = useState({});

  function resetStates() {
    setError('');
  }

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      route?.params?.BookTestData
        ? set_bkData(JSON.parse(route.params.BookTestData))
        : navigation.goBack();
    });
    return unsubscribe;
  }, [route, route.params]);

  /* Thyrocare Test Booking */
  const createThyroBooking = async () => {
    setIsLoading(true);
    try {
      if(bkData.isSimira) {
        bkData.is_thyrocare = false;
        const payload = {
          countryCode: "91",
          mobile: user.phone.substring(3),
          fullName: bkData.patientInfo.firstName+" "+bkData.patientInfo.lastName,
          email: bkData.patientInfo.email,
          dob: bkData.patientInfo.dob.trim() !== "" ? bkData.patientInfo.dob.split("T")[0] : "",
          designation: bkData.patientInfo?.gender === 'Male' ? 'Mr.' : 'Ms.',
          age: age_from_dob(
            bkData.patientInfo.dob),
          gender: bkData.patientInfo?.gender,
          area: bkData.address,
          city: bkData.city,
          state: bkData.state,
          pincode: bkData.pincode.toString(),
          patientType: "IP",
          patientId: bkData.patientId,
          isHomeCollection: 1,
          homeCollectionDateTime: moment(bkData.appointmentDate).format('YYYY-MM-DDThh:mm:00Z'),
          address: bkData.address,
          billDetails: {
            emergencyFlag: "0",
            totalAmount: "", //Number(bkData.amount.toFixed(0)),
            advance: "0",
            organizationIdLH: 324559,
            paymentType: bkData.paymentType,
            billDate: new Date().toISOString(),
            testList: [{ departmentName: "Pathology",
            dictionaryId: null,
            integrationCode: "",
            isProfile: 1,
            sampleId: null,
            testAmount: bkData.amount.toFixed(0),
            testCategory: "-",
            testCode: "Summer Offer",
            testDescription: "This dummy text coming from API\n1. dunrlktj kltjkjdkl glkfdfd klsdfj \n2. jshfjkdfh djkfh djfkdhfjkd fjkdf",
            testID: 3267600, testList: bkData.selectedTests }], //.map((tst) => tst.value.code).join(','),
            paymentType: "cash",
            paymentList: [
              {
                paymentType: "cash",
                paymentAmount: "", //Number(bkData.amount.toFixed(2)),
                issueBank: ""
              }
            ]
          }
        };

        console.log("BOOKING PATIENT INFO", bkData.patientInfo, bkData);
        var isSelf = true;
        if(bkData.patientInfo.relation !== "Self" && bkData.patientInfo.relation !== null) {
          isSelf = false;
        } else {
          isSelf = true;
        }

        var patient = {
            countryCode: "91",
            mobile: bkData.patientInfo.phone.length > 10 ? bkData.patientInfo.phone.substr(bkData.patientInfo.phone.length - 10) : "",
            fullName: bkData.patientInfo.firstName+" "+bkData.patientInfo.lastName,
            email: bkData.patientInfo.email,
            dob: bkData.patientInfo.dob,
            designation: bkData.patientInfo.gender === "Male" ? "Mr." : "Ms.",
            age: "",
            gender: bkData.patientInfo.gender,
            area: bkData.address,
            city: bkData.city,
            state: bkData.state,
            pincode: bkData.pincode,
            patientType: "IP"
          };

        console.log("PATIENT PAYLOAD", patient);
        var patientId = bkData.patientId
        
        const patientRegistration = await simiraApi.addPatient(patient);
        console.log("PATIENT REGISTRATION RESPONSE", patientRegistration);
        var simira_patientId = 0;
        if(patientRegistration.data.code === 200) { // registered successfully
          simira_patientId = patientRegistration.data.patientId;
          payload.patientId = simira_patientId;

          //UPDATE SIMIRA PATIENT ID IN THE SYSTEM
          if(isSelf) {
            const updateId = await users.updateSimiraId_Self(user._id, simira_patientId);
            console.log("UPDATE SELF SIMIRA PATIENTID: ", updateId);
          } else {
            const updateId = await familyMember.updateSimiraId_family(bkData.patientId, simira_patientId);
            console.log("UPDATE FAMILY MEMBER SIMIRA PATIENTID: ", updateId);
          }
        }
        
        console.log('SIMIRA BEFORE BOOKING PAYLOAD --------------- ', payload);
        const resp = await simiraApi.createBooking(payload);
        console.log('SIMIRA-API BOOKING CREATE RESPONSE -------->', resp);

        console.log("BKDATA", bkData);
       
        if(bkData.test_how !== undefined && bkData.test_how === "lab_visit") {
          // CONFIRM SIMIRA LAB VISIT BOOKING
          const confirm_res = await simiraApi.appointmentConfirm(resp.data.billId, resp.data.appointmentId);
          console.log("CONFIRM BOOKING RESPONSE!", confirm_res);
        }

        if (resp?.ok) {
          createHNBooking(payload, resp.data);
        } else {
          setError(resp?.data?.errors[0].msg);
        }
        
      } else {
        const payload = {
          apiKey: bkData.apiKey,
          accessToken: bkData.accessToken,
          orderId: bkData.orderId,
          gender: bkData.patientInfo?.gender === 'Male' ? 'male' : 'female',
          address: bkData.address,
          pincode: bkData.pincode.toString(),
          product: bkData.selectedTests.map((tst) => tst.value.code).join(','),
          std: null,
          phoneNo: null,
          mobile: user.phone.substring(3),
          email: bkData.patientInfo.email,
          tsp: null,
          serviceType: 'H',
          orderBy: 'DSA',
          remarks: bkData.user_notes,
          reportCode: '',
          rate: bkData.fees,
          hc: 0.0,
          apptDate: moment(bkData.appointmentDate).format('YYYY-MM-DD hh:mm A'),
          discount: 0.0,
          passon: 0.0,
          reports: 'N',
          refCode: '7738943013',
          payType: 'POSTPAID',
          margin: '0',
          benCount: '1',
          benDataXML: `<NewDataSet><Ben_details><Name>${
            bkData.patientInfo.firstName
          } ${bkData.patientInfo.lastName}</Name><Age>${age_from_dob(
            bkData.patientInfo.dob,
          )}</Age><Gender>${
            bkData.patientInfo.gender === 'Male' ? 'M' : 'F'
          }</Gender></Ben_details></NewDataSet>`,
        };
        console.log('thyrocare create booking payload --------------- ', payload);
        const resp = await thyrocareApi.createDASBooking(payload);
        console.log('thyrocareApi.createDASBooking resp -------->', resp);
        if (['RES02012'].includes(resp?.data?.respId)) {
          createHNBooking(payload, resp.data);
        } else {
          setError(resp?.data?.response);
        }
      }
    } catch (thyroErr) {
      console.log('thyrocareApi.createDASBooking catch =>', thyroErr);
      setError('Server Error in Test Booking Apis');
    }
    setIsLoading(false);
  };

  /* HN Test Booking */
  const createHNBooking = async (thyroPayload, thyroResp) => {
    setIsLoading(true);
    try {
      const payload = {
        orderId: bkData.orderId,
        userId: bkData.userId,
        doctorId: bkData.doctorId,
        bookForOthers: user._id === bkData.patient ? false : true,
        patient: bkData.patient,
        patientId: bkData.patientId,
        consultTypeName: bkData.consultTypeName,
        fees: bkData.fees,
        gst: bkData.gst,
        amount: bkData.amount,
        service_charges: bkData.service_charges,
        appointmentDate: bkData.appointmentDate,
        appointmentTime: bkData.slotTime?.slot,
        appointmentStatus: 'Confirmed',
        user_notes: bkData.user_notes,
        pathology: [
          {
            response: thyroResp,
            value: bkData.selectedTests.map((tst) => tst.value),
          },
        ],
        is_thyrocare: bkData.is_thyrocare,
        payment_mode: thyroPayload.payType,
      };

      const resp = await pathologyApi.addPathology(payload);
      console.log('HN pathology resp data ================ ', resp);
      if (resp?.ok) {
        if (resp?.data?.orderId) navigateOnSuccess();
      } else
        setError(resp?.data?.errors?.[0]?.msg || 'Create Pathology Test error');
    } catch (error) {
      console.log('pathologyApi.addPathology catch =>', error);
      setError('Server Error in Create Pathology Test');
    }
    setIsLoading(false);
  };

  function navigateOnSuccess() {
    navigation.navigate('BookTestSuccess', {
      BookData: JSON.stringify({
        fullName: makeFullName(
          bkData.patientInfo?.firstName,
          bkData.patientInfo?.lastName,
        ),
        gender: bkData.patientInfo?.gender,
        slotDate: bkData.appointmentDate,
        slotLabel: bkData.slotTime?.slot,
      }),
    });
  }

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.content}>
        <View style={styles.header}>
          <AppHeading style={GetTextStyle(undefined, 2.6, 'bold', 'center')}>
            Book A Test
          </AppHeading>
        </View>

        <View style={styles.section}>
          <TestDetailsBox testData={bkData} />
        </View>

        <View style={styles.section}>
          {bkData.doctor?._id ? (
            <Text style={GetTextStyle(undefined, 1.8, 'bold', 'center')}>
              Prescribed by{' '}
              {makeFullName(
                bkData.doctor.firstName,
                bkData.doctor.lastName,
                'Dr.',
              )}
            </Text>
          ) : null}
        </View>

        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.bk_wrapper}>
          <Text
            style={[
              GetTextStyle(undefined, 2.0, 'bold', 'center'),
              {marginBottom: 14},
            ]}>
            Fees to be paid when samples to be collected
          </Text>
          <Book_Fees_Row
            rName="Consultation"
            rValue={bkData.fees}
            showBullets={false}
          />
          <Book_Fees_Row rName="GST" rValue={bkData.gst} showBullets={false} />
          <Book_Fees_Row
            rName="Service Charges"
            rValue={bkData.service_charges}
            showBullets={false}
          />
          <DividerX style={{marginTop: 5, marginBottom: 12}} />
          <Book_Fees_Row
            rName="Total Fees"
            rValue={bkData.amount}
            fWeight="bold"
            showBullets={false}
          />
        </View>

        <View style={{marginBottom: 40}}>
          <AppButtonPrimary
            isDisabled={false}
            width={responsiveWidth(100) * 0.6}
            btTitle={'CONFIRM BOOKING'}
            aspect_ratio={0.21}
            style={{alignSelf: 'center'}}
            btPress={createThyroBooking}
          />
        </View>
      </View>
    </View>
  );
}

const TestDetailsBox = ({testData}) => {
  return (
    <AppBoxShadowInner aspect_ratio={2 / 3} content_style={AppStyles.centerXY}>
      <View style={styles.box_wrapper}>
        <Text style={styles.box_heading}>Test Details</Text>
        <Text style={styles.box_subheading}>
          Appointment for{' '}
          {makeFullName(
            testData.patientInfo?.firstName,
            testData.patientInfo?.lastName,
          )}
        </Text>
        <View style={styles.info_wrapper}>
          {testData.selectedTests?.length
            ? testData.selectedTests.map((item) => (
                <InfoPill key={item._id} text={item.name} />
              ))
            : null}
        </View>
        <View style={{marginBottom: 5}}>
          <Text style={styles.box_date_time}>
            {Day_dd_Mon(new Date(testData.appointmentDate))},{' '}
            {testData.slotTime?.slot}
          </Text>
        </View>
      </View>
    </AppBoxShadowInner>
  );
};

const InfoPill = ({text}) => <Text style={styles.info_pill}>{text}</Text>;

const Book_Fees_Row = ({rName, rValue, fWeight, showBullets = true}) => (
  <View style={styles.bk_fees_row}>
    {showBullets && <View style={styles.bk_fees_row_bullet}></View>}
    <Text style={styles.bk_fees_row_key(fWeight)}>{rName}</Text>
    <Text style={styles.bk_fees_row_value}>Rs. {rValue?.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: IsAndroid ? 30 : 80,
    paddingBottom: 0,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    flexShrink: 1,
    alignItems: 'center',
    marginBottom: 25,
  },
  section: {
    flexShrink: 1,
    marginBottom: 20,
  },
  box_wrapper: {flex: 1, paddingHorizontal: 10, ...AppStyles.centerXY},
  box_heading: {
    ...GetTextStyle(undefined, 2.6, 'bold', 'center'),
    marginBottom: 10,
  },
  box_subheading: {
    ...GetTextStyle(undefined, 2.2, undefined, 'center'),
    marginBottom: 10,
  },
  info_wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  info_pill: {
    ...GetTextStyle(undefined, 1.5),
    textAlign: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5,
  },
  box_date_time: {
    ...GetTextStyle(AppStyles.colors.blue, 1.7, undefined, 'center'),
  },
  bk_wrapper: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  bk_fees_row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  bk_fees_row_bullet: {
    width: 7,
    height: 7,
    backgroundColor: AppStyles.colors.oliveGreen,
    borderRadius: 30,
    marginRight: 7,
  },
  bk_fees_row_key: (fWeight) => ({
    ...GetTextStyle(undefined, 2, fWeight),
  }),
  bk_fees_row_value: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2, 'bold'),
    marginLeft: 'auto',
  },
  bk_submit: {
    width: responsiveWidth(100) * 0.56,
    alignSelf: 'center',
    marginBottom: 25,
  },
});
