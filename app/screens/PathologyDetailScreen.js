import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, ScrollView} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppHeading from '../components/AppHeading';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import {Day_dd_Mon, makeFullName, isUTCDatePast} from '../config/functions';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';

const WIDTH = Container_Width;

export default function PathologyDetailScreen({route, navigation}) {
  /* Variables */
  let consult_icon;

  /* States */
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pathology, set_pathology] = useState(null);

  function resetStates() {
    setError('');
  }

  /* Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      console.log("PATHOLOGY ROUTE!!!", route?.params?.detail);
      set_pathology(route?.params?.detail);
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (pathology?._id) {
      processPathologyDetails();
    }
  }, [pathology]);

  /* Functions */
  function processPathologyDetails() {
    const pathDetails = {...pathology};
    if (pathDetails.is_past === undefined) {
      if (pathDetails.appointmentStatus === 'Completed') {
        pathDetails.is_past = true;
      } else if (pathDetails.appointmentStatus === 'Cancelled') {
        pathDetails.is_past = true;
      } else if (
        isUTCDatePast(new Date(pathDetails.appointmentDate), -15 * 60 * 1000)
      ) {
        pathDetails.is_past = true;
        if (pathDetails.appointmentStatus === 'Confirmed') {
          pathDetails.appointmentStatus = 'Missed';
        }
      } else {
        pathDetails.is_past = false;
      }
      console.log("PATHLOGY DETAILS", pathDetails);
      set_pathology(pathDetails);
    }
    consult_icon =
      pathDetails.consultTypeName === 'CC'
        ? require('../assets/images/sun_miday.png')
        : require('../assets/images/no_image.png');
  }

  return pathology ? (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <LoadingIndicator visible={isLoading} />
        <View style={styles.content}>
          <View style={styles.header}>
            {pathology.appointmentStatus === 'Completed' ? (
              <AppHeading
                style={GetTextStyle('#64AA0C', 2.6, 'bold', 'center')}>
                Test Completed
              </AppHeading>
            ) : pathology.appointmentStatus === 'Cancelled' ? (
              <AppHeading
                style={GetTextStyle('#9F0606', 2.6, 'bold', 'center')}>
                Test Cancelled
              </AppHeading>
            ) : pathology.appointmentStatus === 'Missed' ? (
              <AppHeading
                style={GetTextStyle('#9F0606', 2.6, 'bold', 'center')}>
                Test Missed
              </AppHeading>
            ) : pathology.appointmentStatus === 'Rescheduled' ? (
              <AppHeading
                style={GetTextStyle('#BC8001', 2.6, 'bold', 'center')}>
                Test Rescheduled
              </AppHeading>
            ) : (
              <AppHeading
                style={GetTextStyle(undefined, 2.6, 'bold', 'center')}>
                Test Confirmed
              </AppHeading>
            )}
          </View>

          <View style={styles.section}>
            <TestDetailsBox testData={pathology} />
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <View style={styles.section}>
            {pathology.doctorData?._id ? (
              <Text style={GetTextStyle(undefined, 1.8, 'bold', 'center')}>
                Prescribed by{' '}
                {makeFullName(
                  pathology.doctorData.firstName,
                  pathology.doctorData.lastName,
                  'Dr.',
                )}
              </Text>
            ) : null}
          </View>

          <View style={{marginBottom: 25}}>
            <Text style={styles.sub_title}>Reason for Booking Test</Text>
            <AppBoxShadowInner
              aspect_ratio={0.27}
              content_style={{padding: 15}}>
              <Text style={GetTextStyle(undefined, 1.9)}>
                {pathology.user_notes}
              </Text>
            </AppBoxShadowInner>
          </View>

          <View style={{marginBottom: 25}}>
            <Text style={styles.sub_title}>Address to Collect Samples</Text>
            <AppBoxShadowInner
              aspect_ratio={0.27}
              content_style={{padding: 15}}>
              <Text style={GetTextStyle(undefined, 1.9)}>
                {pathology.pathology.length &&
                  pathology.pathology[0].response.address ? pathology.pathology[0].response.address : "Not Available"}
              </Text>
            </AppBoxShadowInner>
          </View>
        </View>
      </ScrollView>
    </View>
  ) : (
    <View>
      <Text>Fetching...</Text>
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
            testData.patient?.firstName,
            testData.patient?.lastName,
          )}
        </Text>
        <View style={styles.info_wrapper}>
          {testData.pathology?.length
            ? testData.pathology[0].value.map((item, inx) => (
                <InfoPill key={(item.code !== undefined ? item.code : item.testCode) + '-' + inx} text={item.name !== undefined ? item.name : item.testName} />
              ))
            : null}
        </View>
        <View style={{marginBottom: 5}}>
          <Text style={styles.box_date_time}>
            {Day_dd_Mon(new Date(testData.appointmentDate))},{' '}
            {testData.appointmentTime}
          </Text>
        </View>
      </View>
    </AppBoxShadowInner>
  );
};

const InfoPill = ({text}) => <Text style={styles.info_pill}>{text}</Text>;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    paddingTop: IsAndroid ? 15 : 40,
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
  section: {
    marginBottom: 20,
  },
  sub_title: {
    ...GetTextStyle(undefined, 1.75, 'bold'),
    marginBottom: 12,
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
});
