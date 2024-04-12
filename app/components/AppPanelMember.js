import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppBoxShadow from './AppBoxShadow';
import AppButtonSecondary from './AppButtonSecondary';
import AppStyles, {GetTextStyle} from '../config/style';
import {makeFullName, age_from_dob} from '../config/functions';

const ICON_MALE = require('../assets/images/user_male.png');
const ICON_FEMALE = require('../assets/images/user_female.png');

export default function AppPanelMember({navigation, member}) {
  const ICON = member?.gender === 'Male' ? ICON_MALE : ICON_FEMALE;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.panel_image_wrap}>
          <AppBoxShadow
            width={30}
            height={30}
            borderRadius={25}
            shadowRadius={1}
            content_style={AppStyles.centerXY}>
            <Image style={styles.member_icon} source={ICON} />
          </AppBoxShadow>
        </View>
        <View style={styles.panel_wrap}>
          <Text style={GetTextStyle('#888888', 1.8)}>{member?.gender}</Text>
          <Text style={GetTextStyle('#333333', 2.0, 'bold')}>
            {makeFullName(member?.firstName, member?.lastName)}
          </Text>
          <Text style={GetTextStyle(undefined, 1.8)}>
            {age_from_dob(new Date(member?.dob))}
          </Text>
        </View>
        <View style={styles.panel_aside_wrap}>
          <Text style={styles.panel_pill}>{member?.relation}</Text>
          <AppButtonSecondary
            btTitle={'Edit'}
            width={responsiveWidth(100) * 0.13}
            aspect_ratio={0.5}
            shadowRadius={2}
            borderRadius={4}
            btPress={() =>
              navigation.navigate('AddFamilyMember', {
                FlyMemberId: member?._id,
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#D2D9E5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  panel_image_wrap: {
    flexBasis: '15%',
    flexDirection: 'row',
  },
  member_icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  panel_wrap: {
    flex: 1,
  },
  panel_aside_wrap: {
    flexShrink: 1,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  panel_pill: {
    ...GetTextStyle('#2167C5', 1.5),
    backgroundColor: '#E0E6ED',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});
