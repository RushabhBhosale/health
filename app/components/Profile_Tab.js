import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppButtonSecondary from './AppButtonSecondary';
import AppPanelBordered from './AppPanelBordered';
import AppPanelPolicy from './AppPanelPolicy';
import AppPanelMember from './AppPanelMember';
import {DividerX} from './AppCommonComponents';
import {dd_Mon_yyyy, cm_to_FeetInches, makeFullName} from '../config/functions';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import { useTranslation } from 'react-i18next';

const WIDTH = Container_Width;

export default function Profile_Tab({
  tabData = {},
  navigation,
  medInsurances,
  flyMembers,
}) {
  const {t, i18n} = useTranslation();
  const {feet, inches} = cm_to_FeetInches(tabData?.height);
  return (
    <View style={styles.tab_wrapper}>
      <ScrollView contentContainerStyle={styles.scroll_view}>
        <View style={styles.tab_content}>
          <View style={styles.title_button}>
            <Text style={GetTextStyle(undefined, 1.85, 'bold')}>
              {t("account_details")}
            </Text>
            <AppButtonSecondary
              btTitle={'Edit'}
              width={responsiveWidth(100) * 0.13}
              aspect_ratio={0.5}
              shadowRadius={2}
              borderRadius={4}
              btPress={() =>
                navigation.navigate('EditPersonalDetails', {
                  number: tabData?.phone,
                  redirect: '',
                })
              }
            />
          </View>

          <View style={{marginBottom: 20}}>
            <View>
              <Text style={GetTextStyle('#333333', 1.85)}>{t('name')}</Text>
              <Text style={GetTextStyle('#888888', 1.85)}>
                {makeFullName(tabData?.firstName, tabData?.lastName)}
              </Text>
            </View>
            <DividerX style={{marginVertical: 15}} />
            <View>
              <Text style={GetTextStyle('#333333', 1.85)}>{t('email')}</Text>
              <Text style={GetTextStyle('#888888', 1.85)}>
                {tabData?.email}
              </Text>
            </View>
            <DividerX style={{marginVertical: 15}} />
            <View>
              <Text style={GetTextStyle('#333333', 1.85)}>{t('dob')}</Text>
              <Text style={GetTextStyle('#888888', 1.85)}>
                {dd_Mon_yyyy(new Date(tabData?.dob))}
              </Text>
            </View>
            <DividerX style={{marginVertical: 15}} />
            <View>
              <Text style={GetTextStyle('#333333', 1.85)}>{t('gender')}</Text>
              <Text style={GetTextStyle('#888888', 1.85)}>
                {tabData?.gender}
              </Text>
            </View>
            <DividerX style={{marginVertical: 15}} />
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text style={GetTextStyle('#333333', 1.85)}>{t('height')}</Text>
                <Text style={GetTextStyle('#888888', 1.85)}>
                  {`${feet} feet ${inches} inches`}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={GetTextStyle('#333333', 1.85)}>{t('weight')}</Text>
                <Text style={GetTextStyle('#888888', 1.85)}>
                  {tabData?.weight} kg
                </Text>
              </View>
            </View>
            <DividerX style={{marginVertical: 15}} />
            <View>
              <Text style={GetTextStyle('#333333', 1.85)}>{t('pincode')}</Text>
              <Text style={GetTextStyle('#888888', 1.85)}>
                {tabData?.pincode}
              </Text>
            </View>
            <DividerX style={{marginVertical: 15}} />
          </View>

          {/* medInsurances?.length ? (
            <View style={{marginBottom: 40}}>
              <View style={[styles.title_button, {marginBottom: 5}]}>
                <Text style={GetTextStyle(undefined, 1.85, 'bold')}>
                  Medical Insurance
                </Text>
                <AppButtonSecondary
                  btTitle={'Add'}
                  width={responsiveWidth(100) * 0.13}
                  aspect_ratio={0.5}
                  shadowRadius={2}
                  borderRadius={4}
                  btPress={() => navigation.navigate('AddMedInsurance')}
                />
              </View>
              {medInsurances.map((item, index) => {
                return (
                  <AppPanelPolicy
                    key={'policy-' + index}
                    navigation={navigation}
                    policy={item}
                    userId={tabData?._id}
                  />
                );
              })}
            </View>
          ) : (
            <AppPanelBordered
              backgroundColor={'#E6F0F6'}
              borderColor={'#D6EAF6'}
              style={{marginBottom: 20}}
              pnl_title={
                <Text
                  style={[
                    GetTextStyle('#003375', 1.9, 'bold'),
                    {marginBottom: 13},
                  ]}>
                  Medical Insurance
                </Text>
              }
              pnl_image={require('../assets/images/img_shield.png')}
              pnl_text={
                <Text style={GetTextStyle(undefined, 1.5)}>
                  For your financial protection incase of a serious illness
                </Text>
              }
              button_config={{
                btTitle: 'ADD MEDICAL INSURANCE',
                gradientBorderColor: '#ECF1F5',
                btPress: () => navigation.navigate('AddMedInsurance'),
              }}
            />
          ) */}

          {flyMembers?.length ? (
            <View style={{marginBottom: 40}}>
              <View style={[styles.title_button, {marginBottom: 5}]}>
                <Text style={GetTextStyle(undefined, 1.85, 'bold')}>
                  {t('family_members')}
                </Text>
                <AppButtonSecondary
                  btTitle={'Add'}
                  width={responsiveWidth(100) * 0.13}
                  aspect_ratio={0.5}
                  shadowRadius={2}
                  borderRadius={4}
                  btPress={() => navigation.navigate('AddFamilyMember')}
                />
              </View>
              {flyMembers.map((item, index) => {
                return (
                  <AppPanelMember
                    key={'member-' + index}
                    navigation={navigation}
                    member={item}
                  />
                );
              })}
            </View>
          ) : (
            <AppPanelBordered
              backgroundColor={'#E1EDDC'}
              borderColor={'#D7E6D0'}
              style={{marginBottom: 20}}
              pnl_title={
                <Text
                  style={[
                    GetTextStyle('#3E7000', 1.9, 'bold'),
                    {marginBottom: 13},
                  ]}>
                  {t('family_members')}
                </Text>
              }
              pnl_image={require('../assets/images/img_family.png')}
              pnl_text={<Text style={GetTextStyle(undefined, 1.5)}></Text>}
              button_config={{
                btTitle: t('add_family_member'),
                shadow02Color: '#CCD9BE',
                gradientColorArray: ['#72AE27', '#6DA527'],
                gradientBorderColor: '#E3FCC6',
                btPress: () => navigation.navigate('AddFamilyMember'),
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tab_wrapper: {
    flex: 1,
    width: responsiveWidth(100),
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  scroll_view: {width: responsiveWidth(100), alignItems: 'center'},
  tab_content: {
    width: WIDTH,
  },
  title_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
