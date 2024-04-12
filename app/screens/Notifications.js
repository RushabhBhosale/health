import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SectionList,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import moment from 'moment';
import AutoHeightImage from 'react-native-auto-height-image';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppButtonBack from '../components/AppButtonBack';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonBasic from '../components/AppButtonBasic';
import {DividerX, ThumbPlaceholder} from '../components/AppCommonComponents';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import {makeFullName, getFullUrl} from '../config/functions';
import notificationApi from '../api/notification';
import appointmentApi from '../api/appointment';
import AuthContext from '../auth/context';
import NotificationContext from '../auth/notificationContext';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import { useTranslation } from 'react-i18next';

const WIDTH = Container_Width;

export default function Notifications({navigation}) {
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [Notifications, set_Notifications] = useState([]);
  const [NoteList, set_NoteList] = useState([]);
  const {hasUnreadNote, set_hasUnreadNote} = useContext(NotificationContext);

  function resetStates() {
    setError('');
  }

  /* Side Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      getNotification();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (Notifications.length) {
      let read = [],
        unread = [];
      for (let i = 0; i < Notifications.length; i++) {
        Notifications[i].readAt
          ? read.push(Notifications[i])
          : unread.push(Notifications[i]);
      }
      set_NoteList([
        {
          title: 'Unread Messages',
          data: [...unread],
          withDivider: true,
        },
        {title: 'Old Messages', data: [...read]},
      ]);
      unread.length ? set_hasUnreadNote(false) : set_hasUnreadNote(true);
    }
  }, [Notifications]);

  /* Async api calls */
  const getNotification = async () => {
    setIsLoading(true);
    const resp = await notificationApi.getNotification('Patient', user._id);
    if (resp?.ok) {
      if (resp?.data?.length) set_Notifications(resp.data);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Notifications',
      );
    }

    setIsLoading(false);
  };

  const updateNotification = async (noteId) => {
    setIsLoading(true);
    let updateStatus = false;
    const resp = await notificationApi.updateReadAt(noteId);
    if (resp?.ok) {
      if (resp?.data?._id) updateStatus = true;
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in updating Notifications',
      );
    }
    setIsLoading(false);
    return updateStatus;
  };

  const fetchAppointment = async (id) => {
    setIsLoading(true);
    let appointment = false;
    const resp = await appointmentApi.getAppointmentById(id);
    if (resp?.ok) {
      if (resp?.data?._id) appointment = resp.data;
    } else {
      setError(resp?.data?.errors?.[0]?.msg || 'Error in fetching Appointment');
    }
    setIsLoading(false);
    return appointment;
  };

  /* Functions */
  const handleNotePressed = async (note) => {
    if (note.noteType === 'Appointment') {
      if (note.noteData.appointment) {
        const appointment = await fetchAppointment(note.noteData.appointment);
        if (appointment?._id) {
          if (await updateNotification(note._id)) {
            navigation.navigate('AppointmentDetail', {
              detail: appointment,
            });
          }
        }
      }
    } else if (note.noteType === 'Prescription') {
      if (note.noteData?.PrescriptionId) {
        if (await updateNotification(note._id)) {
          navigation.navigate('PrescriptionDetail', {
            PrescriptionId: note.noteData.PrescriptionId,
          });
        }
      }
    } else if (note.noteType === 'FollowUp') {
      if (note.noteData?.DoctorId) {
        if (await updateNotification(note._id)) {
          navigation.navigate('Doctor', {
            DoctorId: note.noteData.DoctorId,
          });
        }
      }
    } else if (note.noteType === 'Profile') {
      if (await updateNotification(note._id)) {
        navigation.navigate('EditPersonalDetails', {
          number: user.phone,
          redirect: 'dashboard',
        });
      }
    } else if (note.noteType === 'Family') {
      if (await updateNotification(note._id)) {
        navigation.navigate('AddFamilyMember');
      }
    } else if (note.noteType === 'Insurance') {
      if (note.noteData?.patientId) {
        if (await updateNotification(note._id)) {
          navigation.navigate('AddMedInsurance');
        }
      }
    } else if (note.noteType === 'Document') {
      if (note.noteData?.DocumentId) {
        if (await updateNotification(note._id)) {
          navigation.navigate('ProfileDetail');
        }
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.content}>
        <LoadingIndicator visible={isLoading} />
        <View style={styles.header}>
          <AppButtonBack
            style={styles.back_button}
            btPress={() => navigation.goBack()}
          />
          <AppHeading>{t("notifications")}</AppHeading>
        </View>

        <View style={styles.sub_header}>
          <AppPara style={styles.sub_title}>
            {t("notification_remarks")}
          </AppPara>
        </View>

        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.message_section}>
            {NoteList.length ? (
              <SectionList
                sections={NoteList}
                keyExtractor={messageKeyExtractor}
                renderSectionHeader={MessageHeader}
                renderItem={MessageItem(handleNotePressed)}
                ItemSeparatorComponent={ItemDivider}
                renderSectionFooter={({section}) =>
                  section.data.length ? null : (
                    <Text style={styles.no_data_text}>No Message</Text>
                  )
                }
                style={{
                  width: '100%',
                }}
              />
            ) : (
              <Text style={styles.no_data_text}>{t("no_notifications")}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const messageKeyExtractor = (item, index) => 'message-item-' + index;

const MessageHeader = ({section: {title}}) => (
  <Text style={styles.section_title}>{title}</Text>
);

const ItemDivider = () => <DividerX style={styles.item_divider_x} />;

const MessageItem = (handleNotePressed) => ({item, index, section}) => {
  const isLastMsg = index === section.data.length - 1;
  const is_unread = item.readAt ? false : true;
  const notePressed = is_unread ? handleNotePressed : handleNotePressed;
  // const sender = item?.doctor;
  // const subtitle = makeFullName(
  //   sender?.firstName,
  //   sender?.lastName,
  //   'Dr.',
  // );
  // const mThumbnail = getFullUrl(sender?.avtar, 'doctors/' + sender?.userId + '/');
  // const mIsVerified =
  //   sender?.is_verified || sender?.request_verification === 'verified';
  const is_media = false;
  const mi_info_wrap_basis = is_media ? '75%' : '100%';
  const mTitle_color = is_unread ? '#0D6BC8' : '#777777';
  // const mSub_color = is_unread ? '#888888' : '#AAAAAA';
  const mi_info_basis = is_unread ? '90%' : '100%';
  const with_button = false;

  return (
    <>
      <View style={[styles.mi_wrapper, isLastMsg && {marginBottom: 10}]}>
        <TouchableWithoutFeedback
          onPress={notePressed ? async () => await notePressed(item) : null}>
          <View style={styles.mi_row}>
            {/* {is_media && (
              <View style={styles.mi_thumb_wrap}>
                {!mThumbnail ? (
                  <Image style={styles.mi_thumb} source={{uri: mThumbnail}} />
                ) : (
                  <ThumbPlaceholder
                    fName={sender?.firstName}
                    lName={sender?.lastName}
                  />
                )}
                {mIsVerified && (
                  <Image
                    style={styles.mi_online_status}
                    source={require('../assets/images/online_status.png')}
                  />
                )}
              </View>
            )} */}

            <View style={styles.mi_info_wrap(mi_info_wrap_basis)}>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.mi_info(mi_info_basis)}>
                  <AppHeading style={styles.mi_info_title(mTitle_color)}>
                    {item.title}
                  </AppHeading>
                  {/* <AppPara style={styles.mi_info_sub(mSub_color)}>
                  {item.title}
                </AppPara>
                <AppPara style={styles.mi_info_sub(mSub_color)}>
                  {moment(item.sentAt).format('h:mma, Do MMM YYYY')}
                </AppPara> */}
                </View>
                {is_unread && (
                  <View style={styles.mi_view_msg}>
                    <AppButtonBasic
                      borderRadius={30}
                      backgroundColor="transparent"
                      style={{flex: -1}}
                      btPress={() => console.log('Button Pressed...')}>
                      <AutoHeightImage
                        width={26}
                        source={require('../assets/images/icon_chevron_next.png')}
                      />
                    </AppButtonBasic>
                  </View>
                )}
              </View>
              {with_button ? (
                <AppButtonSecondary
                  btTitle={'BUY NOW'}
                  width={responsiveWidth(100) * 0.2}
                  aspect_ratio={0.32}
                  shadowRadius={2}
                  borderRadius={4}
                  fontSize={responsiveFontSize(1.5)}
                  style={{marginTop: 10}}
                  btPress={() => console.log('BUY NOW pressed...')}
                />
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {section.withDivider && isLastMsg ? (
        <DividerX style={styles.section_divider_x} />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: IsAndroid ? 30 : 80,
    marginBottom: 5,
  },
  header: {
    flexShrink: 1,
    width: WIDTH,
    marginBottom: 20,
    paddingVertical: 5,
  },
  back_button: {
    position: 'absolute',
    zIndex: 1,
  },
  sub_header: {
    flexShrink: 1,
    width: WIDTH,
    marginBottom: 30,
    alignItems: 'center',
  },
  sub_title: {
    width: '80%',
    fontSize: responsiveFontSize(1.8),
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    flex: 1,
    width: WIDTH,
  },
  message_section: {
    flex: 1,
    width: responsiveWidth(100),
    alignSelf: 'center',
  },
  section_title: {
    width: WIDTH,
    alignSelf: 'center',
    ...GetTextStyle(undefined, 1.7, 'bold'),
    marginBottom: 15,
  },
  mi_wrapper: {
    width: WIDTH,
    alignSelf: 'center',
  },
  mi_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mi_thumb_wrap: {
    flexBasis: '25%',
    flexDirection: 'row',
    paddingRight: 5,
    alignSelf: 'flex-start',
  },
  mi_thumb: {
    flexBasis: '90%',
    aspectRatio: 1 / 1,
    borderRadius: 20,
    marginTop: 3,
  },
  mi_online_status: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 2,
    right: 12,
  },
  mi_info_wrap: (basis) => ({
    flexBasis: basis,
  }),
  mi_info: (basis) => ({
    flexBasis: basis,
  }),
  mi_info_title: (color) => ({
    color,
    fontSize: responsiveFontSize(1.9),
    textAlign: 'left',
  }),
  mi_info_sub: (color) => ({
    color,
    fontSize: responsiveFontSize(1.6),
  }),
  mi_view_msg: {
    flexBasis: '10%',
    justifyContent: 'center',
  },
  item_divider_x: {
    marginVertical: 15,
    width: WIDTH,
    alignSelf: 'center',
  },
  section_divider_x: {
    marginVertical: 20,
  },
  no_data_text: {
    ...GetTextStyle(undefined, undefined, undefined, 'center'),
  },
});
