import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppStyles from '../config/style';

const checkMark = require('../assets/images/icon_checked.png');
const unCheckMark = require('../assets/images/icon_unchecked.png');

export default function PermissionItem({
  pText,
  iSrc,
  borderBottom,
  id,
  locationPermission,
  cameraPermission,
  notificationPermission,
}) {
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    checkAppPermissions();
  }, [
    permission,
    locationPermission,
    cameraPermission,
    notificationPermission,
  ]);

  const checkAppPermissions = async () => {
    if (id === 'location') {
      setPermission(locationPermission);
    }

    if (id === 'camera') {
      setPermission(cameraPermission);
    }

    if (id === 'notification') {
      setPermission(notificationPermission);
    }
  };

  let borderBottomWidth = borderBottom ? 2 : 0;
  let borderBottomColor = borderBottom ? AppStyles.colors.grey02 : null;
  return (
    <View style={{borderBottomWidth, borderBottomColor, ...styles.pmItem}}>
      <View>
        {permission ? (
          <Image style={styles.imgCheck} source={checkMark} />
        ) : (
          <Image style={styles.imgCheck} source={unCheckMark} />
        )}
      </View>
      <View>
        <Image style={styles.imgIcon} source={iSrc} />
      </View>
      <View>
        <Text style={styles.pmText}>{pText}</Text>
      </View>
    </View>
  );
}

var styles = StyleSheet.create({
  pmItem: {
    paddingVertical: 15,
    flexDirection: 'row',
    // width: responsiveWidth(60),
    alignItems: 'center',
  },
  imgCheck: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    resizeMode: 'contain',
  },
  imgIcon: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    resizeMode: 'contain',
    marginLeft: 15,
    marginRight: 8,
  },
  pmText: {
    fontSize: responsiveFontSize(1.9),
    color: AppStyles.colors.darkgrey,
  },
});
