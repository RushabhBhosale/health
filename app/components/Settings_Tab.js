import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import ToggleSwitch from 'toggle-switch-react-native';
import {DividerX} from './AppCommonComponents';
import simpleAlert from '../utility/alert-boxes';
import AppStyles, {GetTextStyle, Container_Width} from '../config/style';
import { useTranslation } from 'react-i18next';

const WIDTH = Container_Width;

export default function Settings_Tab({tabData, saveUser}) {
  const {t, i18n} = useTranslation();
  const [Notification, set_Notification] = useState(false);
  const [SMS, set_SMS] = useState(false);
  const [Email, set_Email] = useState(false);
  const [Profile, set_Profile] = useState(false);
  const [Documents, set_Documents] = useState(false);

  useEffect(() => {
    set_Notification(tabData?.allow_notification ? true : false);
    set_SMS(tabData?.allow_sms ? true : false);
    set_Email(tabData?.allow_email ? true : false);
    set_Profile(tabData?.allow_profile ? true : false);
    set_Documents(tabData?.allow_documents ? true : false);
  }, [tabData]);

  const saveSettings = (payload, settingName) => {
    simpleAlert({
      title: 'Change Setting!',
      content: `Do you want to change ${settingName} setting?`,
      okText: 'Confirm',
      okCallback: () => saveUser(payload),
      showCancel: true,
    });
  };

  return (
    <View style={styles.tab_container}>
      <ScrollView contentContainerStyle={styles.scroll_container}>
        <View style={styles.content}>
          <View style={styles.tab_row}>
            <View style={{flexShrink: 1}}>
              <Text style={styles.tab_text_1}>{t('notification')}</Text>
              <Text style={styles.tab_text_2}>
                {t('notification_remarks')}
              </Text>
            </View>
            <CustomToggleSwitch
              isOn={Notification}
              setIsOn={(val) =>
                saveSettings({allow_notification: val}, 'Notification')
              }
              iconText={['ON', 'OFF']}
            />
          </View>
          <DividerX style={{marginBottom: 17}} />

          <View style={{marginBottom: 5}}>
            <Text style={styles.tab_text_1}>{t('communication')}</Text>
            <Text style={styles.tab_text_2}>
              {t('communication_descr')}
            </Text>
          </View>

          <View style={styles.tab_row}>
            <Text style={styles.tab_text_1}>SMS</Text>
            <CustomToggleSwitch
              isOn={SMS}
              setIsOn={(val) => saveSettings({allow_sms: val}, 'SMS')}
            />
          </View>

          <View style={styles.tab_row}>
            <Text style={styles.tab_text_1}>EMAIL</Text>
            <CustomToggleSwitch
              isOn={Email}
              setIsOn={(val) => saveSettings({allow_email: val}, 'EMAIL')}
            />
          </View>

          <DividerX style={{marginBottom: 17}} />

          <View style={{marginBottom: 12}}>
            <Text style={styles.tab_text_1}>{t("sharing_prefs")}</Text>
            <Text style={styles.tab_text_2}>
              {t("sharing_prefs_descr")}
            </Text>
          </View>

          <View style={styles.tab_row}>
            <Text style={styles.tab_text_1}>{t('profile')}</Text>
            <CustomToggleSwitch
              isOn={Profile}
              setIsOn={(val) => saveSettings({allow_profile: val}, 'Profile')}
            />
          </View>

          <View style={styles.tab_row}>
            <Text style={styles.tab_text_1}>{t('documents')}</Text>
            <CustomToggleSwitch
              isOn={Documents}
              setIsOn={(val) =>
                saveSettings({allow_documents: val}, 'Documents')
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CustomToggleSwitch = ({
  isOn,
  setIsOn,
  iconText = ['YES', 'NO'],
  ...restProps
}) => {
  let icon_color = isOn ? '#99DD44' : '#A0B4DD';
  let icon_text = isOn ? iconText[0] : iconText[1];
  return (
    <ToggleSwitch
      isOn={isOn}
      onColor="#99DD44"
      offColor="#A0B4DD"
      onToggle={setIsOn}
      size="medium"
      icon={<Text style={GetTextStyle(icon_color, 1.1)}>{icon_text}</Text>}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  tab_container: {
    marginTop: 15,
    marginBottom: 25,
    flex: 1,
    width: responsiveWidth(100),
    alignItems: 'center',
  },
  scroll_container: {
    flexGrow: 1,
    width: responsiveWidth(100),
  },
  content: {
    width: WIDTH,
  },
  tab_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tab_text_1: {
    ...GetTextStyle(undefined, 1.8, 'bold'),
    marginBottom: 3,
  },
  tab_text_2: {
    ...GetTextStyle('#888888', 1.8),
  },
});
