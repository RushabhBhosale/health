import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppButtonSecondary from '../components/AppButtonSecondary';
import {DividerX} from '../components/AppCommonComponents';
import LoadingIndicator from '../components/LoadingIndicator';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import AppErrorMessage from '../components/AppErrorMessage';
import AuthContext from '../auth/context';
import {makeFullName, dd_Mon_yyyy} from '../config/functions';
import settings from '../config/settings';

const config = settings();
const WIDTH = Container_Width;

export default function InvoiceDetailScreen({navigation, route}) {
  const {user, setUser} = useContext(AuthContext);

  /* State Variables */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [Appointment, set_Appointment] = useState({});

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.APPOINTMENT) set_Appointment(route.params.APPOINTMENT);
    });
    return unsubscribe;
  }, [route, route.params]);

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
          <AppHeading style={styles.headingText}>Invoice Details</AppHeading>

          <View style={{}}>
            <Text style={styles.header}>
              {makeFullName(
                Appointment?.userData?.firstName,
                Appointment?.userData?.lastName,
              )}
            </Text>
            <Text style={styles.sub_header(10)}>
              For Appointment on{' '}
              {dd_Mon_yyyy(new Date(Appointment.appointmentDate))} at{' '}
              {Appointment?.appointmentTime}
            </Text>
            <Text style={styles.sub_header()}>
              Refered By,{' '}
              {makeFullName(
                Appointment?.doctorData?.firstName,
                Appointment?.doctorData?.lastName,
                'Dr.',
              )}
            </Text>
          </View>

          <View style={styles.section}>
            <Book_Fees_Row rName="Consultation" rValue={Appointment?.fees} />
            <Book_Fees_Row
              rName="Service Charges"
              rValue={Appointment?.service_charges}
            />
            <Book_Fees_Row rName="GST" rValue={Appointment?.gst} />
            <DividerX style={{marginTop: 5, marginBottom: 12}} />
            <Book_Fees_Row
              rName="Total Fees"
              rValue={Appointment?.amount}
              fWeight="bold"
            />
          </View>

          <AppButtonSecondary
            btTitle={'CLOSE'}
            width={responsiveWidth(100) * 0.16}
            aspect_ratio={0.39}
            shadowRadius={3}
            borderRadius={4}
            btPress={() => navigation.goBack()}
          />
        </View>
      </ScreenScrollable>
    </View>
  );
}

const Book_Fees_Row = ({rName, rValue, fWeight, showBullets = true}) => (
  <View style={styles.bk_fees_row}>
    {showBullets && <View style={styles.bk_fees_row_bullet}></View>}
    <Text style={styles.bk_fees_row_key(fWeight)}>{rName}</Text>
    {rValue ? (
      <Text style={styles.bk_fees_row_value}>Rs. {rValue?.toFixed(2)}</Text>
    ) : (
      <Text style={styles.bk_fees_row_value}>--</Text>
    )}
  </View>
);

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
    marginBottom: 10,
  },
  sub_header: (marginBottom = 20) => ({
    ...GetTextStyle('#888888', 1.8, undefined, 'center'),
    marginBottom,
  }),
  section: {
    width: '100%',
    marginBottom: 20,
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
    ...GetTextStyle('#333333', 2, fWeight),
  }),
  bk_fees_row_value: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2, 'bold'),
    marginLeft: 'auto',
  },
});
