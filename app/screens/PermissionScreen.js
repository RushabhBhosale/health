import React from 'react';
import {StyleSheet, View} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppLogo from '../components/AppLogo';
import AppHeading from '../components/AppHeading';
import PermissionContent from '../components/PermissionContent';
import AppStyles from '../config/style';

const permissionItems = [
  {
    id: 'camera',
    title: 'Access to Camera',
    icon: {
      name: 'camera',
      backgroundColor: AppStyles.colors.primary,
      src: require('../assets/images/icon_camera.png'),
    },
  },
  {
    id: 'location',
    title: 'Access to Location',
    icon: {
      name: 'location-enter',
      backgroundColor: AppStyles.colors.secondary,
      src: require('../assets/images/icon_location.png'),
    },
  },
  {
    id: 'notification',
    title: 'Access Notification',
    icon: {
      name: 'notification-clear-all',
      backgroundColor: AppStyles.colors.secondary,
      src: require('../assets/images/icon_notification.png'),
    },
  }
];

export default function PermissionScreen({navigation, route}) {
  const { redirect } = route.params;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <AppLogo width={responsiveWidth(16)} />
      </View>

      <View style={styles.subHeader}>
        <AppHeading style={styles.subtext}>Allow Permissions</AppHeading>
      </View>

      <View style={styles.content}>
        <PermissionContent data={permissionItems} navigation={navigation} redirect={redirect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: AppStyles.colors.lightgrey,
  },
  header: {
    flex: 2,
  },
  subHeader: {
    flex: 1,
  },
  content: {
    flex: 10,
    width: responsiveWidth(70), //'70%',
  },
});
