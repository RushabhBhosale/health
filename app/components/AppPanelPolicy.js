import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import AppButtonSecondary from './AppButtonSecondary';
import AppStyles, {GetTextStyle} from '../config/style';
import {dd_mm_yyyy, isDatePast} from '../config/functions';
import settings from '../config/settings';

const config = settings();
const BASE_URL = config.cdnUrl;

export default function AppPanelPolicy({navigation, policy, userId}) {
  const Is_InAcitve = isDatePast(new Date(policy?.expiryDate));
  return (
    <View style={styles.container}>
      <View style={styles.row_01}>
        <Text style={GetTextStyle('#3C7ACE', 2.0, 'bold')}>
          Policy {policy?.policyNumber}
        </Text>
        <AppButtonSecondary
          btTitle={'Edit'}
          width={responsiveWidth(100) * 0.13}
          aspect_ratio={0.5}
          shadowRadius={2}
          borderRadius={4}
          style={{marginLeft: 'auto'}}
          btPress={() =>
            navigation.navigate('AddMedInsurance', {
              InsuranceId: policy?._id,
            })
          }
        />
      </View>

      <View style={styles.row_02}>
        <View style={styles.panel_image_wrap}>
          <AutoHeightImage
            width={responsiveWidth(100) * 0.17}
            source={{uri: prepDocUri(policy?.policyDocument?.uri, userId)}}
            style={styles.panel_image}
          />
        </View>
        <View style={styles.panel_wrap}>
          <Text style={GetTextStyle(undefined, 1.8)}>
            Expiry - {dd_mm_yyyy(new Date(policy?.expiryDate))}
          </Text>
          <Text style={GetTextStyle('#888888', 1.8)}>
            Covered by {policy?.insuranceProvider}
          </Text>
          <Text style={GetTextStyle('#888888', 2.0)}>
            {'\u20B9'}{' '}
            <Text style={GetTextStyle('#888888', 2.0, 'bold')}>
              {policy?.policyAmount}
            </Text>
          </Text>
          <AppButtonSecondary
            isDisabled={Is_InAcitve}
            btTitle={Is_InAcitve ? 'IN-ACTIVE' : 'ACTIVE'}
            titleColor={'#FFFFFF'}
            width={responsiveWidth(100) * 0.25}
            aspect_ratio={0.3}
            shadowRadius={1}
            borderRadius={4}
            fontSize={responsiveFontSize(1.6)}
            backgroundColor={'#8BC641'}
            style={{marginTop: 10, backgroundColor: '#B5B5B5'}}
          />
        </View>
      </View>
    </View>
  );
}

function prepDocUri(docName, userId) {
  return BASE_URL + 'patients/' + userId + '/' + docName;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#D2D9E5',
  },
  row_01: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  row_02: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  panel_image_wrap: {
    flexBasis: '25%',
    flexDirection: 'row',
  },
  panel_image: {
    borderWidth: 1,
    borderColor: '#D2D9E5',
    maxHeight: 110,
  },
  panel_wrap: {
    flexBasis: '75%',
  },
});
