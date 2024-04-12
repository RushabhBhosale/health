import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppCardPathology from './AppCardPathology';
import AppCardAppointment from './AppCardAppointment';
import AppStyles from '../config/style';

export default function Appointment_Tab({appointments, navigation}) {
  const navigateToDetails = (item) =>
    navigation.navigate(
      item.pathology ? 'PathologyDetail' : 'AppointmentDetail',
      {
        detail: item,
      },
    );

  const navigateToPrescriptionDetail = (appointment) => {
    navigation.navigate('PrescriptionDetail', {
      APPOINTMENT: appointment,
    });
  };

  return (
    <View style={styles.flat_list}>
      <FlatList
        data={appointments}
        renderItem={RenderCard(
          appointments.length,
          navigateToDetails,
          navigateToPrescriptionDetail,
        )}
        keyExtractor={CardKeyExtractor}
      />
    </View>
  );
}

const RenderCard = (
  totalItems,
  navigateToDetails,
  navigateToPrescriptionDetail,
) => ({item, index}) => {
  let last_item = index + 1 === totalItems ? {marginBottom: 40} : {};
  return (
    <View
      style={{
        width: responsiveWidth(100),
        alignItems: 'center',
        paddingVertical: 10,
        ...last_item,
      }}>
      {item.pathology ? (
        <AppCardPathology
          aspect_ratio={0.4}
          item={item}
          cardPressed={navigateToDetails}
        />
      ) : (
        <AppCardAppointment
          aspect_ratio={0.4} 
          item={item}
          cardPressed={navigateToDetails}
          buttonPressed={navigateToPrescriptionDetail}
        />
      )}
    </View>
  );
};

const CardKeyExtractor = (item, index) => 'card-' + item._id;

const styles = StyleSheet.create({
  flat_list: {
    width: responsiveWidth(100),
    alignItems: 'center',
    alignSelf: 'center',
  },
});
