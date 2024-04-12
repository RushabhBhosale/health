import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import AutoHeightImage from 'react-native-auto-height-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Yup from 'yup';
import moment from 'moment';
import HTML from 'react-native-render-html';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppBoxShadowInner from '../components/AppBoxShadowInner';
import AppBoxShadow from '../components/AppBoxShadow';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppRadioInputPlus from '../components/AppRadioInputPlus';
import AppButtonBack from '../components/AppButtonBack';
import AppForm from '../components/AppForm';
import AppFormButton from '../components/AppFormButton';
import AppFormInput from '../components/AppFormInput';
import AppFormSelect from '../components/AppFormSelect';
import AppSelectInput from '../components/AppSelectInput';
import ImagePickerControlPrompt from '../components/ImagePickerControlPrompt';
import AppErrorMessage from '../components/AppErrorMessage';
import AppModalBottomUp from '../components/AppModalBottomUp';
import {DividerX, ThumbPlaceholder} from '../components/AppCommonComponents';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import {Day_dd_Mon_YYYY, makeFullName, getFullUrl} from '../config/functions';
import DOCTOR_PROFILE, {PARENT_SLOT, SLOT} from './DoctorProfileData';

import AuthContext from '../auth/context';
import notificationApi from '../api/notification';
import doctorsApi from '../api/doctors';
import slotApi from '../api/slot';
import orderApi from '../api/order';
import uploadsApi from '../api/uploads';
import appointmentApi from '../api/appointment';
import blockApi from '../api/block';
import flyMembersApi from '../api/familyMember';
import crPolicyApi from '../api/cancelRefundPolicy';
import MapView, {Marker} from 'react-native-maps';
import RazorpayCheckout from 'react-native-razorpay';
import LoadingIndicator from '../components/LoadingIndicator';
import settings from '../config/settings';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18next';

const config = settings();
const WIDTH = Container_Width;
const THUMB_BORDER_RADIUS = 18;
const VIDEO_ICON = require('../assets/images/icon_video.png');
const CLINIC_ICON = require('../assets/images/icon_building.png');
const MAX_IMAGES_LIMIT = 10;

let DocObj = null;
let name,
  degree,
  distance,
  experience,
  consultation,
  specialty,
  profile_image,
  bankAccount;

export default function DoctorProfileScreen({route, navigation}) {
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  const ref_bottomPopup = useRef();
  const ref_slotPopup = useRef();
  const ref_policyPopup = useRef();

  /* ===== STATES ===== */
  const [isLoading, setIsLoading] = useState(false);
  const [docInfo, set_docInfo] = useState(DOCTOR_PROFILE);
  const [DoctorId, set_DoctorId] = useState();
  const [DoctorData, set_DoctorData] = useState(null);
  const [activeTab, set_activeTab] = useState(1);
  const [error, setError] = useState('');
  const [FeesAmount, set_FeesAmount] = useState(0);
  const [GST_cent, set_GST_cent] = useState(18);
  const [GST_amount, set_GST_amount] = useState(0);
  const [SvCharge_cent, set_SvCharge_cent] = useState(15);
  const [SvChargeLimit, set_SvChargeLimit] = useState(200);
  const [SvCharge_amount, set_SvCharge_amount] = useState(0);
  const [grandTotal, set_grandTotal] = useState(0);
  const [currencyUnit, set_currencyUnit] = useState(100);
  const [consultHappening, set_consultHappening] = useState(
    DOCTOR_PROFILE?.tab_consultation?.happening[0].id,
  );
  const [consultType, set_consultType] = useState();
  const [selected_consult_type, set_selected_consult_type] = useState();
  const [consultClinic, set_consultClinic] = useState();
  const [availableBlocks, set_availableBlocks] = useState([]);
  const [selectedBlock, set_selectedBlock] = useState();
  const [selected_date, set_selected_date] = useState();
  const [selected_slot, set_selected_slot] = useState();
  const [flyMembers, set_flyMembers] = useState([]);
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [policyData, set_policyData] = useState();
  const [policyVersion, set_policyVersion] = useState('');
  const [appointmentPhotos, set_appointmentPhotos] = useState([{uri: ''}]);
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [currentDropdown, set_currentDropdown] = useState(0);
  const [is_reschedule, set_is_reschedule] = useState(false);
  const [appointment, setAppointment] = useState();

  function resetStates() {
    setIsLoading(false);
    set_docInfo(DOCTOR_PROFILE);
    set_DoctorData(null);
    set_activeTab(1);
    setError('');
    set_FeesAmount(0);
    set_GST_cent(18);
    set_GST_amount(0);
    set_SvCharge_cent(15);
    set_SvChargeLimit(200);
    set_SvCharge_amount(0);
    set_grandTotal(0);
    set_currencyUnit(100);
    set_consultHappening(DOCTOR_PROFILE?.tab_consultation?.happening[0].id);
    set_consultClinic();
    set_availableBlocks([]);
    set_selectedBlock();
    set_selected_date();
    set_selected_slot();
    set_flyMembers([]);
    set_FormDataObject(getFormData());
    set_policyData();
    set_policyVersion('');
    set_appointmentPhotos([{uri: ''}]);
    set_isScreenScrollable(true);
    set_currentDropdown(0);
    set_is_reschedule(false);
  }

  /* ====== Side Effects ====== */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      if (route?.params?.item) {
        DocObj = route.params.item;
        resetDoctorState();
      }
      if (route?.params?.DoctorId) set_DoctorId(route.params.DoctorId);
      if (route?.params?.IS_RESCHEDULE) set_is_reschedule(true);
      if (route?.params?.appointment) {
        setAppointment(route?.params?.appointment);
      }
    });
    fetchFamilyMembers();
    loadPolicy();
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (DoctorData) {
      DocObj = DoctorData;
      resetDoctorState();
    }
  }, [DoctorData]);

  useEffect(() => {
    if (DoctorId) getDoctorDetails(DoctorId);
  }, [DoctorId]);

  useEffect(() => {
    let _date = null,
      _slot = null;
    _date = availableBlocks.find((item) => item._id === selectedBlock?.date);
    _slot = _date?.slots?.find?.(
      (item) => item.dateTime === selectedBlock?.slot,
    );
    set_selected_date(_date);
    set_selected_slot(_slot);
  }, [selectedBlock]);

  useEffect(() => {
    if (consultation?.length) {
      let _consult = consultation.find(
        (item) => item.available && item._id == consultType,
      );
      if (_consult) setConsultTypeByHappen(_consult);
    }
  }, [consultType, consultHappening]);

  function setConsultTypeByHappen(_consultIn) {
    _consultIn.fees =
      consultHappening === 1
        ? _consultIn.fees_firstTime
        : _consultIn.fees_followUp;
    set_selected_consult_type({..._consultIn});
  }

  useEffect(() => {
    if (selected_consult_type?.fees) CalculateSetAmounts();
    if (selected_consult_type) {
      if (selected_consult_type.consultTypeName === 'Video') {
        getDoctorSlot(DocObj?._id, {
          parentSlotInx: PARENT_SLOT.online,
          slotInx: SLOT.online,
        });
      } else {
        let conslt_clinic = null;
        if (DocObj?.clinic?.length) {
          if (appointment && appointment.clinic_id) {
            conslt_clinic = DocObj.clinic.find((dCln) =>
              dCln.fmcId
                ? dCln.fmcId === appointment.clinic_id
                : dCln._id === appointment.clinic_id,
            );
          } else {
            conslt_clinic = consultClinic ? consultClinic : DocObj.clinic[0];
          }
          set_consultClinic({...conslt_clinic});
        }
      }
    }
  }, [selected_consult_type]);

  function CalculateSetAmounts() {
    const grandAmt = Number(selected_consult_type?.fees);
    const gstFactor = GST_cent / 100 + 1,
      servFactor = SvCharge_cent / 100 + 1;
    let totalAmt = 0,
      gstAmt = 0,
      servAmt = 0,
      feesAmt = 0;

    totalAmt = Math.round(grandAmt / gstFactor);
    gstAmt = grandAmt - totalAmt;
    feesAmt = Math.round(totalAmt / servFactor);
    servAmt = totalAmt - feesAmt;
    if (servAmt > SvChargeLimit) {
      servAmt = SvChargeLimit;
      feesAmt = totalAmt - servAmt;
    }

    set_grandTotal(grandAmt);
    set_GST_amount(gstAmt);
    set_SvCharge_amount(servAmt);
    set_FeesAmount(feesAmt);
  }

  useEffect(() => {
    if (consultClinic?._id) {
      getDoctorSlot(DocObj?._id, {
        parentSlotInx: consultClinic.fmcId
          ? PARENT_SLOT.offline
          : PARENT_SLOT.online,
        slotInx:
          selected_consult_type.consultTypeName === 'Video'
            ? SLOT.online
            : SLOT.offline,
        ClinicId: consultClinic.fmcId
          ? consultClinic.fmcId
          : consultClinic?._id,
      });
    }
  }, [consultClinic]);

  useEffect(() => {
    if (appointment) {
      if (consultation?.length && appointment.consultTypeName) {
        consultation.forEach((conslt) => {
          conslt.available &&
            conslt.consultTypeName === appointment.consultTypeName &&
            set_consultType(conslt._id);
        });
      }
      let conslt_happn;
      for (
        let i = 0, happn;
        i < docInfo?.tab_consultation?.happening.length;
        i++
      ) {
        happn = docInfo?.tab_consultation?.happening[i];
        if (appointment.is_firstVisit && happn.label === 'First Time') {
          conslt_happn = happn.id;
          break;
        }
        conslt_happn = happn.id;
      }
      set_consultHappening(conslt_happn);
    }
  }, [appointment]);

  useEffect(() => {
    let blkDate = null,
      blkSlot = null;
    if (availableBlocks?.length) {
      if (appointment) {
        blkDate = moment(appointment.appointmentDate).startOf('day').toDate();
        blkSlot = appointment.appointmentDate;
      } else {
        blkDate = availableBlocks?.[0]?._id;
        blkSlot = availableBlocks?.[0]?.slots[0]?.dateTime;
      }
    }
    set_selectedBlock({
      date: blkDate,
      slot: blkSlot,
    });
  }, [appointment, availableBlocks]);

  useEffect(() => {
    if (flyMembers.length) populateForm();
  }, [flyMembers]);

  /* Functions & Logic */

  function resetDoctorState() {
    initDoctorInfo();
    if (DocObj?._id) getAppointmentExistStatus(DocObj._id);
  }

  function initDoctorInfo() {
    if (DocObj) {
      name = makeFullName(DocObj.firstName, DocObj.lastName, 'Dr.');
      degree = DocObj?.education && DocObj?.education?.[0].highestQualification;
      // distance = (DocObj.distance || 0) + ' kms';
      experience = (DocObj.experience || 0) + ' years exp.';
      consultation = DocObj.consultation;
      for (let i = 0; i < consultation.length; i++) {
        consultation[i].consultTypeName === 'Video'
          ? (consultation[i].icon = 'video-outline')
          : (consultation[i].icon = 'hospital-building');
        !consultType &&
          consultation[i].available &&
          set_consultType(consultation[i]._id);
      }
      specialty = DocObj?.speciality?.title;
      profile_image = getFullUrl(DocObj?.avtar, 'doctors/' + DocObj?._id + '/');
      bankAccount = DocObj?.bankAccount ? DocObj.bankAccount : '';
    }
  }

  const getDoctorDetails = async (_id) => {
    setIsLoading(true);
    try {
      const resp = await doctorsApi.getDoctor(_id);
      if (resp?.ok) {
        if (resp?.data?._id) {
          set_DoctorData(resp.data);
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in fetching doctor details',
        );
      }
    } catch (error) {
      console.log('Error in fetching doctor details', error);
      setError('Error in fetching doctor details');
    }
    setIsLoading(false);
  };

  const fetchFamilyMembers = async () => {
    setIsLoading(true);
    let fly_mem = [{_id: user._id, name: 'Self'}];
    const resp = await flyMembersApi.getUserFlyMembers(user._id);
    if (resp?.ok) {
      if (resp?.data && resp?.data?.length)
        fly_mem = [
          ...fly_mem,
          ...trimArrayObjects(
            characterSort(resp.data, 'firstName', 'lastName'),
          ),
        ];
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching user family members',
      );
    }
    set_flyMembers(fly_mem);
    setIsLoading(false);
  };

  function trimArrayObjects(inList) {
    return inList.map((item) => ({
      _id: item._id,
      name: makeFullName(item.firstName, item.lastName),
    }));
  }

  function characterSort(inArr, key1, key2) {
    const outArr = inArr.sort((a, b) => {
      let fa = (a[key1] + ' ' + a[key2]).toLowerCase(),
        fb = (b[key1] + ' ' + b[key2]).toLowerCase();
      return fa !== fb ? (fa < fb ? -1 : 1) : 0;
    });
    return outArr;
  }

  const loadPolicy = async () => {
    try {
      setIsLoading(true);
      const resp = await crPolicyApi.getCRPolicy({
        criterion: {type: 'Patient'},
      });
      if (resp?.ok) {
        if (resp?.data?._id) set_policyData(resp.data);
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching Cancel-Refund Policy',
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching Cancel-Refund Policy', error);
      setError(error);
    }
  };

  const togglePolicyRadio = (val) => {
    policyVersion ? set_policyVersion('') : set_policyVersion(val);
  };

  const openSelectDropdown = (dropdown) => {
    set_isScreenScrollable(false);
    set_currentDropdown(dropdown);
  };

  const closeSelectDropdown = (dropdown) => {
    set_isScreenScrollable(true);
    set_currentDropdown(dropdown);
  };

  const getAppointmentExistStatus = async (doctorId) => {
    const bkgResp = await appointmentApi.confirmAppointmentExists(
      user._id,
      doctorId,
    );
    if (bkgResp?.ok) {
      if (bkgResp?.data?.isSuccess)
        mutedConsultHappening(bkgResp.data.booking_exists);
    } else {
      setError(
        bkgResp?.data?.errors?.[0]?.msg ||
          'Error in confirming booking between patient and doctor',
      );
    }
  };

  function mutedConsultHappening(bk_ext) {
    const {happening} = docInfo?.tab_consultation;
    if (happening?.length) {
      let _hppng = happening.map((item, index) => {
        if (item.id === 2) {
          item.available = bk_ext ? true : false;
        }
        return item;
      });
      set_docInfo({
        ...docInfo,
        tab_consultation: {...docInfo.tab_consultation, happening: _hppng},
      });
    }
  }

  const getDoctorSlot = async (doctorId, payload) => {
    setIsLoading(true);
    let avail_blks = [];
    const resp = await slotApi.getBookingSlots(doctorId, payload);
    if (resp?.ok) {
      if (resp?.data?.length)
        avail_blks = sortByDateTime(resp.data, 'dateTime');
    } else {
      setError(resp?.data?.errors?.[0]?.msg || 'Error in fetching blocks');
    }
    set_availableBlocks(avail_blks);
    setIsLoading(false);
  };

  function sortByDateTime(arrayIn, sortKey, sortOrder = 0) {
    return arrayIn.map(
      (item) => (
        (item.slots = item.slots.sort((a, b) =>
          !sortOrder
            ? new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
            : new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime(),
        )),
        item
      ),
    );
  }

  const appointmentPhotoSelected = (photoObj, contextObj) => {
    let appointmentImgs = [...appointmentPhotos];
    if (photoObj.uri) {
      photoObj.imageSelected = true;
      appointmentImgs[contextObj.index] = photoObj;
      if (appointmentImgs.length < MAX_IMAGES_LIMIT)
        appointmentImgs.push({uri: ''});
    } else {
      appointmentImgs.splice(contextObj.index, 1);
      if (
        !appointmentImgs.length ||
        appointmentImgs[appointmentImgs.length - 1]?.uri
      )
        appointmentImgs.push({uri: ''});
    }
    set_appointmentPhotos(appointmentImgs);
  };

  const saveAppointmentPhotos = async () => {
    let photoResp = {appointmentPhotos: [], apntPhotos_move: []};
    const form_data = new FormData();
    for (let i = 0; i < appointmentPhotos.length; i++) {
      let pic = appointmentPhotos[i];
      if (pic.imageSelected) {
        form_data.append('appointment_images', {
          name: pic.fileName,
          type: pic.type,
          uri: IsAndroid ? pic.uri : pic.uri.replace('file://', ''),
        });
      } else {
        pic.uri && photoResp.appointmentPhotos.push({image: pic.uri});
      }
    }
    if (form_data._parts.length) {
      try {
        const resp = await uploadsApi.uploadFiles(form_data);
        if (resp?.ok) {
          if (resp?.data?.length) {
            photoResp.apntPhotos_move = resp?.data;
            photoResp.appointmentPhotos = [
              ...photoResp.appointmentPhotos,
              ...resp.data.map((item) => ({image: item.fileName})),
            ];
          }
        } else
          setError(
            resp?.data?.errors?.[0]?.msg || 'Appointment images upload error',
          );
      } catch (error) {
        console.log('Appointment images upload error', error);
        setError(error?.message || 'Appointment images upload error');
      }
    }
    return photoResp;
  };

  const handleReschedule = async (data) => {
    console.log('handleReschedule form data Key-Value pairs: ', data);
    setIsLoading(true);

    const rescheduleBlockResponse = await blockApi.unblockblock(
      appointment.appointmentSlotId,
    );

    if (!rescheduleBlockResponse?.ok) {
      console.log('rescheduleBlockResponse error: ', rescheduleBlockResponse);
      setError(
        rescheduleBlockResponse?.data?.errors?.[0]?.msg ||
          rescheduleBlockResponse?.problem ||
          'Something went wrong. Please try again later.',
      );
    } else if (rescheduleBlockResponse?.ok && rescheduleBlockResponse?.data) {
      const blockPayload = {
        ...selected_slot,
        is_Blocked: true,
        is_Booked: true,
        booking_by_user: user._id,
      };
      const reBlockResponse = await blockApi.createUpdate(blockPayload);

      if (reBlockResponse.ok && reBlockResponse.data) {
        const appointmentUpdateOptions = {
          appointmentDate: selected_slot.dateTime,
          appointmentTime: selected_slot.blockStartTime,
          appointmentSlotId: selected_slot._id,
          rescheduleInitiatedBy: appointment?.rescheduleInitiatedBy
            ? appointment?.rescheduleInitiatedBy
            : 'Patient',
        };

        const appointmentResponse = await appointmentApi.updateAppointment(
          appointmentUpdateOptions,
          appointment._id,
        );

        if (!appointmentResponse?.ok) {
          console.log('appointmentResponse : ', appointmentResponse);
          setError(
            appointmentResponse?.data?.errors?.[0]?.msg ||
              appointmentResponse?.problem ||
              'Something went wrong. Please try again later.',
          );
        } else if (appointmentResponse?.ok && appointmentResponse?.data) {
          // navigate to next screen
          const appointmentInfo = appointmentResponse.data;

          const patientName = makeFullName(
            appointmentInfo?.userData?.firstName,
            appointmentInfo?.userData?.lastName,
          );
          const appointmentDate = moment
            .utc(appointmentInfo?.appointmentDate)
            .format('dddd, MMMM Do YYYY');

          const notePayload = {
            noteFor: 'Doctor',
            noteType: 'Appointment',
            noteData: {
              appointment: appointmentInfo._id,
            },
            title: `Dear doctor, your appointment with, ${patientName} has been reschduled to ${appointmentDate} at ${appointmentInfo?.appointmentTime}`,
            userId: appointmentInfo.doctorId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
          };

          const reschNoteResp = await notificationApi.postNotification(
            notePayload,
          );
          if (!reschNoteResp?.ok)
            setError(
              reschNoteResp?.data?.errors?.[0]?.msg ||
                'Error in posting Notification',
            );

          const doctorName = makeFullName(
            appointmentInfo?.doctorData?.firstName,
            appointmentInfo?.doctorData?.lastName,
          );

          const adminNotiObj = {
            noteFor: 'Admin',
            noteType: 'Appointment',
            title: `Dear admin, the patient ${patientName} has reschduled the
            appointment with the doctor ${doctorName} to ${appointmentDate} at ${appointmentInfo?.appointmentTime}`,
            userId: config.hnAdminId,
            doctor: appointmentInfo?.doctorId,
            patient: appointmentInfo?.userId,
            noteData: {
              appointment: appointmentInfo._id,
            },
          };

          const reschAdmNoteResp = await notificationApi.postAdminNotification(
            adminNotiObj,
          );
          if (!reschAdmNoteResp?.ok)
            setError(
              reschAdmNoteResp?.data?.errors?.[0]?.msg ||
                'Error in posting Admin Notification',
            );

          navigation.navigate('AppointmentConfirmation', {
            appointmentInfo: appointmentInfo,
            IS_RESCHEDULE: true,
          });
        }
      }
    }

    setIsLoading(false);
  };

  const createOrder = async (bkFormData) => {
    try {
      const amount = grandTotal * currencyUnit;
      const fee = FeesAmount * currencyUnit;
      const orderPayload = {doctorId: DocObj._id, amount, fee};
      const orderResponse = await orderApi.addOrder(orderPayload);
      console.log('orderResponse => ', orderResponse);
      if (!orderResponse.ok) {
        setError(
          orderResponse?.data?.errors?.[0]?.msg ||
            orderResponse.problem ||
            'Something went wrong. Please try again later.',
        );
      } else if (orderResponse?.ok && orderResponse?.data?.order) {
        makePayment(bkFormData, orderResponse.data.order);
				/* const dummyOrder = {
					orderId: `dummy_orderId_${Date.now()}`,
					razorPayorderId: `dummy_razorPayorderId_${Date.now()}`,
					razorPayPaymentId: `dummy_razorPayPaymentId_${Date.now()}`,
				};
				bookAppointment(bkFormData, dummyOrder); */
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } catch (orderErr) {
      console.log('orderApi.addOrder catch => ', orderErr);
    }
  };

  const makePayment = async (bkFormData, dbOrder) => {
    const userName = makeFullName(user.firstName, user.lastName);
    // const clinicName = DocObj?.clinic[0]?.clinicName || '';
    // const clinicLogo = DocObj?.clinic[0]?.clinicLogo || '';
    const clinicName = consultClinic?.clinicName || '';
    const clinicLogo = consultClinic?.clinicLogo || '';
    
    var options = {
      description: 'Doctors consultation',
      image: clinicLogo,
      currency: 'INR',
      key: config.razorPayKey,
      name: clinicName,
      order_id: dbOrder.orderId,
      //customer_id: user._id,
      prefill: {
        email: user.email || '',
        contact: user.phone || '',
        name: userName,
      },
      theme: {color: '#53a20e'},
    };
		console.log('Razorpay options => ', options);
    RazorpayCheckout.open(options)
      .then(async (razorpayData) => {
				console.log('Razorpay success razorpayData => ', razorpayData);
        // handle success
        const orderUpdateResp = await orderApi.updateOrder(
          {
            razorpay_payment_id: razorpayData.razorpay_payment_id,
            razorpay_order_id: razorpayData.razorpay_order_id,
            razorpay_signature: razorpayData.razorpay_signature,
          },
          dbOrder._id,
        );
        if (!orderUpdateResp.ok) {
          setError(
            orderUpdateResp?.data?.errors?.[0]?.msg ||
              orderUpdateResp.problem ||
              'Something went wrong. Please try again later.',
          );
        } else if (orderUpdateResp?.ok && orderUpdateResp?.data) {
          const orderUpData = orderUpdateResp.data;
          const order = {
            // orderId: orderUpData?.orderId,
            // this should store the order table id mapping instead of razorpay orderId
            orderId: dbOrder._id,
            razorPayorderId: orderUpData?.razorpay_order_id,
            razorPayPaymentId: orderUpData?.razorpay_payment_id,
          };
          bookAppointment(bkFormData, order);
        } else {
          setError('Something went wrong. Please try again later.');
        }
      })
      .catch((error) => {
        // handle failure
        console.log('Razorpay catch => ', error);
        setError('Error: Payment Failure. Please try again.');
      });
  };

  const bookAppointment = async (bkFormData, order) => {
    // Regular booking
    const blockPayload = {
      ...selected_slot,
      is_Blocked: true,
      is_Booked: true,
      booking_by_user: user._id,
    };
    const blockResponse = await blockApi.createUpdate(blockPayload);

    if (!blockResponse?.ok) {
      setError(
        blockResponse?.data?.errors?.[0]?.msg ||
          blockResponse?.problem ||
          'Something went wrong. Please try again later.',
      );
    } else if (blockResponse?.ok && blockResponse?.data) {
      bkFormData.blockId = blockResponse.data._id;
      const appointmentOptions = await getAppointmentOptions(bkFormData, order);

      const appointmentResponse = await appointmentApi.addAppointment(
        appointmentOptions,
      );

      if (!appointmentResponse?.ok) {
        setError(
          appointmentResponse?.data?.errors?.[0]?.msg ||
            appointmentResponse?.problem ||
            'Something went wrong. Please try again later.',
        );
      } else if (appointmentResponse?.ok && appointmentResponse?.data) {
        const appointmentInfo = appointmentResponse.data;
        const patientName =
          (appointmentInfo?.userData?.firstName || '') +
          ' ' +
          (appointmentInfo?.userData?.lastName || '');
        const doctorName =
          (appointmentInfo?.doctorData?.firstName || '') +
          ' ' +
          (appointmentInfo?.doctorData?.lastName || '');
        const appointmentDate = moment
          .utc(appointmentInfo?.appointmentDate)
          .format('dddd, MMMM Do YYYY');

        const notePayload = {
          noteFor: 'Patient',
          noteType: 'Appointment',
          noteData: {
            appointment: appointmentInfo._id,
          },
          title: `Dear patient, you have an appointment with a doctor, ${doctorName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime}`,
          userId: appointmentInfo.userId,
          patient: appointmentInfo?.userId,
          doctor: appointmentInfo?.doctorId,
        };

        const noteResp = await notificationApi.postNotification(notePayload);
        if (!noteResp?.ok)
          setError(
            noteResp?.data?.errors?.[0]?.msg || 'Error in posting Notification',
          );

        const docNotePayload = {
          noteFor: 'Doctor',
          noteType: 'Appointment',
          noteData: {
            appointment: appointmentInfo._id,
          },
          title: `Dear doctor, you have an appointment with a patient, ${patientName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime}`,
          userId: appointmentInfo.doctorId,
          doctor: appointmentInfo?.doctorId,
          patient: appointmentInfo?.userId,
        };

				const docNoteResp = await notificationApi.postNotification(docNotePayload);
        if (!docNoteResp?.ok)
          setError(
            docNoteResp?.data?.errors?.[0]?.msg ||
              'Error in posting Notification',
          );

        const adminNotiObj = {
          noteFor: 'Admin',
          noteType: 'Appointment',
          title: `Dear admin, the patient ${patientName} has been Booked the appointment with the doctor ${doctorName} on ${appointmentDate} at ${appointmentInfo?.appointmentTime}`,
          userId: config.hnAdminId,
          doctor: appointmentInfo?.doctorId,
          patient: appointmentInfo?.userId,
          noteData: {
            appointment: appointmentInfo._id,
          },
        };

        const adminNoteResp = await notificationApi.postAdminNotification(
          adminNotiObj,
        );
        if (!adminNoteResp?.ok)
          setError(
            adminNoteResp?.data?.errors?.[0]?.msg ||
              'Error in posting Admin Notification',
          );

        navigation.navigate('AppointmentConfirmation', {
          appointmentInfo: appointmentInfo,
        });
      }
    }
  };

  const getAppointmentOptions = async (bkFormData, order) => {
    let is_fmc = false,
      clinic_id = null,
      clinic_name = '';
    if (selected_consult_type?.consultTypeName !== 'Video') {
      clinic_name = consultClinic.clinicName;
      if (consultClinic?.fmcId) {
        is_fmc = true;
        clinic_id = consultClinic.fmcId;
      } else clinic_id = consultClinic._id;
    }
    const appointmentOptions = {
      userId: user?._id,
      doctorId: DocObj?._id,
      patient: bkFormData.book_for._id,
      bookForOthers: bkFormData.book_for._id === user._id ? false : true,
      consultTypeName: selected_consult_type?.consultTypeName,
      is_fmc,
      clinic_id,
      clinic_name,
      fees: FeesAmount,
      service_charges: SvCharge_amount,
      gst: GST_amount,
      amount: grandTotal,
      is_firstVisit:
        consultHappening === docInfo?.tab_consultation?.happening[0].id
          ? true
          : false,
      appointmentDate: selected_slot.dateTime,
      appointmentTime: selected_slot.blockStartTime,
      appointmentSlotId: bkFormData.blockId,
      is_prescription_available: false,
      user_notes: bkFormData.book_reason,
      // discountCoupon: bkFormData.book_coupon,
      cancelRefundPolicy: policyVersion,
      orderId: order?.orderId,
      razorPayorderId: order?.razorPayorderId,
      razorPayPaymentId: order?.razorPayPaymentId,
      payment_status: 'Paid',
      ...(await saveAppointmentPhotos()),
    };
    return appointmentOptions;
  };

  /* Form Validation Schema */
  function getFormData() {
    return {
      book_reason: '',
      book_for: null,
      //, book_coupon: ''
    };
  }

  function populateForm() {
    let formObject = {...FormDataObject};
    formObject.book_for = flyMembers[0];
    set_FormDataObject({...formObject});
  }

  const bookingFormSchema = Yup.object().shape({
    book_for: Yup.object(),
    book_reason: Yup.string()
      .required('Consultation Reason is required')
      .max(250, 'Maximum ${max} characters allowed'),
    // book_coupon: Yup.string().max(50, 'Maximum ${max} characters allowed'),
  });

  const handlePayment = async (bkFormData) => {
    setIsLoading(true);
    setError('');

    try {
      is_reschedule ? void 0 : createOrder(bkFormData);
      /* bookAppointment(bkFormData, {
				orderId: 'dummy_order_id',
				razorPayPaymentId: 'dummy_razorpay_payment_id',
			}); */
    } catch (error) {
      setIsLoading(false);
      console.log('Error in sending request', error);
      setError(error);
    }

    setIsLoading(false);
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponderCapture={(event) => closeSelectDropdown(0)}>
      <LoadingIndicator visible={isLoading} />
      <ScreenScrollable
        style={styles.mainContainer}
        scrollEnabled={isScreenScrollable}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>Doctor Profile</AppHeading>
          </View>

          <View style={{marginBottom: 24}}>
            <AppBoxShadowInner
              aspect_ratio={205 / 297}
              content_style={AppStyles.centerXY}>
              <View style={styles.card}>
                <AppBoxShadow
                  width={responsiveWidth(100) * 0.21}
                  aspect_ratio={1 / 1}
                  borderRadius={THUMB_BORDER_RADIUS}
                  style={{marginBottom: 10}}>
                  {profile_image ? (
                    <Image
                      style={styles.cd_thumb}
                      source={{uri: profile_image}}
                    />
                  ) : (
                    <ThumbPlaceholder
                      fName={DocObj?.firstName}
                      lName={DocObj?.lastName}
                    />
                  )}
                </AppBoxShadow>
                <AppHeading style={styles.cd_title}>{name},</AppHeading>
                <View style={{flexDirection: 'row', marginBottom: 5}}>
                  <AppPara style={styles.cd_sub_text}> {specialty} </AppPara>
                  <InfoPill text={experience} />
                  {/* <InfoPill text={distance} /> */}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '80%',
                  }}>
                  <Text style={styles.cd_sub_text_2}>
                    {degree}
                    {/* {docInfo?.degree.length &&
                        docInfo.degree
                          .reduce((acc, itm) => (acc.push(itm.name), acc), [])
                          .join(', ')} */}
                  </Text>
                </View>
              </View>
            </AppBoxShadowInner>
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          {activeTab ? (
            <View style={styles.tab_head}>
              <AppButtonSecondary
                isPressed={activeTab === 1}
                btTitle="CONSULTATION"
                width={(12 + 2) * 0.02 * responsiveWidth(100)}
                height={responsiveWidth(100) * 0.064}
                borderRadius={6}
                fontSize={responsiveFontSize(1.5)}
                style={{marginRight: 12}}
                btPress={() => set_activeTab(1)}
              />
              <AppButtonSecondary
                isPressed={activeTab === 2}
                btTitle="INFO"
                width={(4 + 2) * 0.02 * responsiveWidth(100)}
                height={responsiveWidth(100) * 0.064}
                borderRadius={6}
                fontSize={responsiveFontSize(1.5)}
                style={{marginRight: 12}}
                btPress={() => set_activeTab(2)}
              />
            </View>
          ) : (
            <></>
          )}

          <View style={styles.tab_body}>
            {activeTab === 1 ? (
              <View>
                <View style={{marginBottom: 30}}>
                  <Text style={styles.title_text}>{t('consultation_type')}</Text>
                  <View style={styles.radio_wrap}>
                    {consultation?.length
                      ? consultation.map((item, index) =>
                          item.available ? (
                            <AppRadioInputPlus
                              isDisabled={is_reschedule}
                              key={'consult-type-' + index}
                              radioId={item._id}
                              checkedRadio={consultType}
                              setCheckedRadio={set_consultType}
                              wrapperStyle={{flex: 1}}
                              radioStyle={{marginBottom: 'auto'}}
                              RdLabelElement={RadioLabel(
                                item,
                                is_reschedule,
                                AppStyles.colors.blue,
                                '#5E5E5E',
                                consultHappening,
                                t
                              )}
                            />
                          ) : null,
                        )
                      : null}
                  </View>
                </View>

                {DocObj?.clinic?.length &&
                selected_consult_type?.consultTypeName !== 'Video' ? (
                  <View style={{marginBottom: 30}}>
                    <Text style={styles.title_text}>{t('select_clinic')}</Text>
                    <View style={{marginBottom: 15}}>
                      <AppSelectInput
                        isDisabled={is_reschedule}
                        data={DocObj.clinic}
                        isOpen={currentDropdown === 1}
                        openSelect={() => openSelectDropdown(1)}
                        closeSelect={() => closeSelectDropdown(0)}
                        optionLabel={'clinicName'}
                        selectedOption={consultClinic}
                        set_selectedOption={set_consultClinic}
                        place_holder_option="Select Clinic"
                        dp_max_height={responsiveWidth(100) * 0.6}
                      />
                    </View>
                  </View>
                ) : null}

                <View style={{marginBottom: 35}}>
                  <Text style={styles.title_text}>
                  {t('consultation_why')}
                  </Text>
                  <View style={styles.radio_wrap}>
                    {docInfo?.tab_consultation?.happening.length
                      ? docInfo.tab_consultation.happening.map((item, index) =>
                          item.available ? (
                            <AppRadioInputPlus
                              isDisabled={is_reschedule}
                              key={'consult-happen-' + index}
                              radioId={item.id}
                              checkedRadio={consultHappening}
                              setCheckedRadio={set_consultHappening}
                              wrapperStyle={{flex: 1}}
                              radioStyle={{marginBottom: 'auto'}}
                              RdLabel={item.label}
                              labelStyle={responsiveFontSize(2.2)}
                            />
                          ) : null,
                        )
                      : null}
                  </View>
                </View>

                {is_reschedule ? (
                  <View style={{marginBottom: 35}}>
                    <Text style={styles.title_text}>Previous Slot</Text>
                    <Text style={GetTextStyle(undefined, 1.9, 'bold')}>
                      {appointment
                        ? `${moment
                            .utc(appointment.appointmentDate)
                            .format('ddd, D MMM YYYY')}, ${
                            appointment.appointmentTime
                          }`
                        : null}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}

                <View style={{marginBottom: 37}}>
                  {availableBlocks?.length ? (
                    <>
                      <Text style={styles.title_text}>Available Slots</Text>
                      <View
                        style={{
                          width: responsiveWidth(100),
                          alignSelf: 'center',
                        }}>
                        {availableBlocks?.length ? (
                          <FlatList
                            data={availableBlocks}
                            renderItem={RenderSlot(
                              ref_slotPopup,
                              selectedBlock,
                              set_selectedBlock,
                            )}
                            keyExtractor={keyExtractor}
                            horizontal
                          />
                        ) : null}
                      </View>
                    </>
                  ) : (
                    <Text style={styles.title_text}>{t('no_slot')}</Text>
                  )}
                </View>

                <View style={{marginBottom: 20}}>
                  <Text
                    style={GetTextStyle(undefined, 1.9, undefined, 'center')}>
                    {t('you_selected')}
                  </Text>

                  <View style={styles.selection_row}>
                    <AutoHeightImage
                      width={22}
                      source={
                        selected_consult_type?.consultTypeName === 'Video'
                          ? VIDEO_ICON
                          : CLINIC_ICON
                      }
                      style={{marginRight: 6}}
                    />
                    <Text
                      style={GetTextStyle(undefined, 1.9, 'bold', 'center')}>
                      {selected_consult_type?.consultTypeName &&
                        `${selected_consult_type?.consultTypeName} Consultation, `}
                      {selected_slot?.dateTime &&
                        `${moment
                          .utc(selected_slot.dateTime)
                          .format('ddd, D MMM')}, `}
                      {selected_slot?.blockStartTime}
                    </Text>
                  </View>
                </View>
              </View>
            ) : activeTab === 2 ? (
              <View>
                <View>
                  <Info_Section
                    image={docInfo?.tab_info?.languages?.icon_image}
                    title={docInfo?.tab_info?.languages?.title}>
                    <View>
                      <Text style={GetTextStyle('#888888', 1.85)}>
                        {DocObj?.languages?.length
                          ? DocObj.languages.join(', ')
                          : null}
                      </Text>
                    </View>
                  </Info_Section>

                  <DividerX style={{marginVertical: 20}} />

                  <Info_Section
                    image={docInfo?.tab_info?.education?.icon_image}
                    title={docInfo?.tab_info?.education?.title}>
                    <View>
                      {DocObj?.education?.length ? (
                        <Info_Paras data={DocObj.education} />
                      ) : null}
                    </View>
                  </Info_Section>

                  <DividerX style={{marginVertical: 20}} />

                  {DocObj?.clinic?.[0] ? (
                    <>
                      <Info_Section
                        image={docInfo?.tab_info?.clinic_details?.icon_image}
                        title={docInfo?.tab_info?.clinic_details?.title}
                      />
                      <Clinic_Details
                        clinic={DocObj.clinic[0]}
                        doctorId={DocObj._id}
                        btnAction={() => Linking.openURL(`tel:${DocObj.phone}`)}
                      />
                      <DividerX style={{marginVertical: 20}} />
                    </>
                  ) : null}

                  {/* DocObj?.Services?.length ? (
                    <>
                      <Info_Section
                        image={docInfo?.tab_info?.services?.icon_image}
                        title={docInfo?.tab_info?.services?.title}>
                        <Unorder_List data={DocObj.Services} />
                      </Info_Section>
                      <DividerX style={{marginVertical: 20}} />
                    </>
                  ) : null */}

                  <Info_Section
                    image={docInfo?.tab_info?.location?.icon_image}
                    title={docInfo?.tab_info?.location?.title}
                  />
                  {DocObj?.clinic?.[0]?.location?.coordinates?.length ? (
                    <View style={styles.info_map_wrap}>
                      <View style={styles.map_container}>
                        <MapView
                          style={styles.map_view}
                          initialRegion={{
                            latitude:
                              DocObj?.clinic?.[0]?.location?.coordinates[1],
                            longitude:
                              DocObj?.clinic?.[0]?.location?.coordinates[0],
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                          }}
                          minZoomLevel={12}>
                          <Marker
                            coordinate={{
                              latitude:
                                DocObj?.clinic?.[0]?.location?.coordinates[1],
                              longitude:
                                DocObj?.clinic?.[0]?.location?.coordinates[0],
                            }}
                            title={DocObj?.clinic?.[0]?.clinicName}
                            description={DocObj?.clinic?.[0]?.clinicAddress}
                          />
                        </MapView>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.no_data}>
                      Location coordinates not found, please update your profile
                      with a Pincode
                    </Text>
                  )}

                  <DividerX style={{marginVertical: 20}} />

                  {/* DocObj?.Facilities?.length ? (
                    <>
                      <Info_Section
                        image={docInfo?.tab_info?.facilities?.icon_image}
                        title={docInfo?.tab_info?.facilities?.title}>
                        <Unorder_List
                          data={DocObj.Facilities}
                          showBullets={false}
                        />
                      </Info_Section>
                      <DividerX style={{marginVertical: 20}} />
                    </>
                  ) : null */}

                  <Info_Section
                    image={docInfo?.tab_info?.gallery?.icon_image}
                    title={docInfo?.tab_info?.gallery?.title}
                  />
                  {DocObj?.clinic?.[0]?.clinicPhotos?.length ? (
                    <View
                      style={{
                        width: responsiveWidth(100),
                        marginTop: 13,
                        alignSelf: 'center',
                      }}>
                      <FlatList
                        data={DocObj.clinic[0].clinicPhotos}
                        renderItem={GalleryItem(DocObj._id, setIsLoading)}
                        keyExtractor={GalleryKey}
                        horizontal={true}
                      />
                    </View>
                  ) : (
                    <Text style={styles.no_data}>No Gallery Image</Text>
                  )}

                  <DividerX style={{marginVertical: 20}} />

                  {/* DocObj?.Awards?.length ? (
                    <>
                      <Info_Section
                        image={docInfo?.tab_info?.awards?.icon_image}
                        title={docInfo?.tab_info?.awards?.title}>
                        <View>
                            <Info_Paras data={DocObj.Awards} />
                        </View>
                      </Info_Section>
                      <DividerX style={{marginVertical: 20}} />
                    </>
                  ) : null */}

                  <Info_Section
                    image={docInfo?.tab_info?.registration?.icon_image}
                    title={docInfo?.tab_info?.registration?.title}
                    style={{marginBottom: 20}}>
                    <Text>
                      {DocObj?.registration?.regNumber}{' '}
                      {DocObj?.registration?.regCouncil}
                    </Text>
                  </Info_Section>
                </View>
              </View>
            ) : (
              <View>
                <AppButtonBack
                  style={{position: 'absolute'}}
                  btPress={() => set_activeTab(1)}
                />
                <View style={{marginBottom: 40}}>
                  <Text style={GetTextStyle(undefined, 2.0, 'bold', 'center')}>
                    You have selected
                  </Text>
                  <View style={styles.booking_consult}>
                    <AutoHeightImage
                      width={22}
                      source={
                        selected_consult_type?.consultTypeName === 'Video'
                          ? VIDEO_ICON
                          : CLINIC_ICON
                      }
                      style={{marginRight: 6}}
                    />
                    <Text
                      style={GetTextStyle(
                        AppStyles.colors.linkcolor,
                        2.0,
                        'bold',
                        'center',
                      )}>
                      {selected_consult_type?.consultTypeName} Consultation,{' '}
                    </Text>
                  </View>
                  <Text
                    style={GetTextStyle(
                      AppStyles.colors.linkcolor,
                      1.7,
                      'bold',
                      'center',
                    )}>
                    {selected_slot?.dateTime &&
                      moment.utc(selected_slot.dateTime).format('ddd, D MMM')}
                    , {selected_slot?.blockStartTime} - {'\u20B9'} {FeesAmount}{' '}
                    (Fees)
                  </Text>
                </View>

                <AppForm
                  initialValues={FormDataObject}
                  validationSchema={bookingFormSchema}
                  onSubmit={handlePayment}>
                  <View style={styles.form_control_wrap}>
                    <AppFormSelect
                      name="book_for"
                      data={flyMembers}
                      isOpen={currentDropdown === 2}
                      openSelect={() => openSelectDropdown(2)}
                      closeSelect={() => closeSelectDropdown(0)}
                      optionLabel={'name'}
                      place_holder_option="Select Booking For"
                      dp_max_height={responsiveWidth(100) * 0.6}
                      style={styles.inputField}
                    />
                  </View>

                  <View style={styles.form_control_wrap}>
                    <AppFormInput
                      name="book_reason"
                      keyboardType="default"
                      placeholder={'Share reason of consultation'}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      aspect_ratio={0.36}
                      style={styles.inputField}
                    />
                  </View>

                  {/* <View style={styles.form_control_wrap}>
                    <AppFormInput
                      name="book_coupon"
                      keyboardType="default"
                      placeholder={'Apply coupon code'}
                      style={styles.inputField}
                    />
                  </View> */}

                  <View style={styles.form_control_wrap}>
                    <View style={styles.img_picker_row}>
                      {appointmentPhotos?.length
                        ? appointmentPhotos.map((item, index) => (
                            <View
                              key={'appointment-photo-' + index}
                              style={{marginRight: 12, marginBottom: 16}}>
                              <ImagePickerControlPrompt
                                contextObj={{index}}
                                pickedImage={{
                                  uri: item.imageSelected ? item.uri : null,
                                }}
                                imagePicked={appointmentPhotoSelected}
                                _width={responsiveWidth(100) * 0.24}
                                aspect_ratio={0.75}
                              />
                            </View>
                          ))
                        : null}
                    </View>
                  </View>

                  <View style={{marginBottom: 40}}>
                    <Text
                      style={[
                        GetTextStyle(undefined, 2.0, 'bold', 'center'),
                        {marginBottom: 14},
                      ]}>
                      Fees to be Paid
                    </Text>
                    <Book_Fees_Row rName="Consultation" rValue={FeesAmount} />
                    <Book_Fees_Row
                      rName="Service Charges"
                      rValue={SvCharge_amount}
                    />
                    <Book_Fees_Row rName="GST" rValue={GST_amount} />
                    <DividerX style={{marginTop: 5, marginBottom: 12}} />
                    <Book_Fees_Row
                      rName="Total Fees"
                      rValue={grandTotal}
                      fWeight="bold"
                    />
                  </View>

                  <View style={{marginBottom: 20}}>
                    <AppRadioInputPlus
                      RdElementImg={require('../assets/images/tick_checked.png')}
                      radioId={policyData?._id}
                      checkedRadio={policyVersion}
                      setCheckedRadio={togglePolicyRadio}
                      outerWidth={25}
                      innerWidth={20}
                      outerRadioBackground={AppStyles.colors.btnText}
                      RdLabelElement={() => (
                        <Text style={styles.policy_radio_label}>
                          I accept Cancellation and Refund Policy
                        </Text>
                      )}
                      wrapperStyle={{flex: 1}}
                    />
                  </View>

                  <View style={{marginBottom: 40}}>
                    {/* <AppButtonPrimary
                      btTitle={'PAY NOW'}
                      aspect_ratio={0.24}
                      style={styles.bk_submit}
                      btPress={handlePayment}
                    /> */}
                    <AppFormButton
                      isDisabled={!Boolean(policyVersion)}
                      btTitle={'PAY NOW'}
                      aspect_ratio={0.24}
                      style={styles.bk_submit}
                    />
                    <AppButtonSecondary
                      btTitle={'CANCELLATION AND REFUND POLICY'}
                      width={responsiveWidth(100) * 0.62}
                      height={23}
                      shadowRadius={2}
                      borderRadius={6}
                      style={{alignSelf: 'center'}}
                      btPress={() => ref_policyPopup.current.open()}
                    />
                  </View>
                </AppForm>
              </View>
            )}
          </View>
        </View>
      </ScreenScrollable>

      {activeTab ? (
        <View style={styles.footer}>
          <TouchableWithoutFeedback
            onPress={() =>
              bankAccount && availableBlocks.length
                ? ref_bottomPopup.current.open()
                : null
            }>
            <View style={styles.footer_inner}>
              {bankAccount ? (
                availableBlocks.length ? (
                  <>
                    <View style={{flexShrink: 1}}>
                      <Text style={GetTextStyle('#ffffff', 1.9)}>
                        Fees {is_reschedule && 'paid'}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={GetTextStyle('#ffffff', 3, 'bold')}>
                          Rs. {selected_consult_type?.fees}
                        </Text>
                      </View>
                      <Text style={GetTextStyle('#B1DFFE', 1.5)}>
                        View Breakup
                      </Text>
                    </View>

                    <View style={{flexShrink: 1}}>
                      <AppButtonSecondary
                        isDisabled={
                          !selected_slot?.dateTime ||
                          !selected_slot?.blockStartTime
                        }
                        btTitle={
                          is_reschedule ? 'RESCHEDULE' : 'BOOK APPOINTMENT'
                        }
                        width={responsiveWidth(100) * 0.5}
                        height={responsiveWidth(100) * 0.12}
                        shadowRadius={3}
                        borderRadius={8}
                        shadow01Color={'#5AA2FF'}
                        shadow02Color={'#124789'}
                        shadow01Offset={{width: 3, height: 3}}
                        fontSize={responsiveFontSize(2.1)}
                        btPress={() =>
                          is_reschedule ? handleReschedule() : set_activeTab(0)
                        }
                      />
                    </View>
                  </>
                ) : (
                  <NotAvailableBlock text={t('no_slot')} />
                )
              ) : (
                <NotAvailableBlock text="Booking Not Available" />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : null}

      <AppModalBottomUp ref={ref_bottomPopup} height={320}>
        <View style={{marginBottom: 40}}>
          <Text
            style={[GetTextStyle(undefined, 2.2, 'bold'), {marginBottom: 14}]}>
            Fees Breakup
          </Text>
          <Book_Fees_Row
            rName="Consultation"
            rValue={FeesAmount}
            showBullets={false}
          />
          <Book_Fees_Row
            rName="Service Charges"
            rValue={SvCharge_amount}
            showBullets={false}
          />
          <Book_Fees_Row rName="GST" rValue={GST_amount} showBullets={false} />
          <DividerX style={{marginTop: 5, marginBottom: 12}} />
          <Book_Fees_Row
            rName="Total Fees"
            rValue={grandTotal}
            fWeight="bold"
            showBullets={false}
          />
        </View>

        {availableBlocks.length ? (
          <AppButtonPrimary
            isDisabled={
              !selected_slot?.dateTime || !selected_slot?.blockStartTime
            }
            width={responsiveWidth(100) * 0.6}
            btTitle={is_reschedule ? 'RESCHEDULE' : 'BOOK APPOINTMENT'}
            aspect_ratio={0.21}
            style={{alignSelf: 'center'}}
            btPress={() => {
              ref_bottomPopup.current.close();
              is_reschedule ? handleReschedule() : set_activeTab(0);
            }}
          />
        ) : (
          <Text style={GetTextStyle(undefined, 2.6, undefined, 'center')}>
            No Slot Available
          </Text>
        )}
      </AppModalBottomUp>

      <AppModalBottomUp
        ref={ref_slotPopup}
        height={400}
        style_content={{flex: 1}}>
        <View style={{marginBottom: 15}}>
          <Text style={[GetTextStyle(undefined, 2.2, 'bold')]}>
            Available slots for {Day_dd_Mon_YYYY(new Date(selected_date?.date))}
          </Text>
        </View>

        <View style={{flex: 1}}>
          <ScrollView>
            <View style={styles.slot_times}>
              {selected_date?.slots.length
                ? selected_date?.slots.map((slot, index) => (
                    <AppButtonSecondary
                      key={'slot-popup' + index}
                      isPressed={
                        selected_date._id === selectedBlock?.date &&
                        slot.dateTime === selectedBlock?.slot
                      }
                      btPress={() =>
                        set_selectedBlock({
                          date: selected_date._id,
                          slot: slot.dateTime,
                        })
                      }
                      btTitle={slot.blockStartTime}
                      width={responsiveWidth(100) * 0.22}
                      height={responsiveWidth(100) * 0.083}
                      borderRadius={6}
                      fontSize={responsiveFontSize(1.8)}
                      style={{marginRight: 10, marginBottom: 14}}
                    />
                  ))
                : null}
            </View>
          </ScrollView>
        </View>
      </AppModalBottomUp>

      <AppModalBottomUp
        ref={ref_policyPopup}
        closeOnDragDown={false}
        height={responsiveHeight(100) - 100}
        closeButton={false}
        style_content={{flex: 1}}>
        {policyData?.title ? (
          <Text style={styles.policy_title}>{policyData.title}</Text>
        ) : null}

        <ScrollView style={styles.policy_scroll}>
          {policyData?.content ? (
            <HTML source={{html: policyData.content}} />
          ) : (
            <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
              No Content
            </Text>
          )}
        </ScrollView>

        <View style={styles.policy_bt_group}>
          <AppButtonPrimary
            btTitle={'ACCEPT'}
            width={responsiveWidth(100) * 0.28}
            aspect_ratio={0.32}
            shadowRadius={2}
            borderRadius={4}
            gradientBorderWidth={2}
            textSize={responsiveFontSize(1.8)}
            style={{alignSelf: 'center'}}
            btPress={() => {
              ref_policyPopup.current.close();
              set_policyVersion(policyData._id);
            }}
          />
          <AppButtonSecondary
            btTitle={'DECLINE'}
            width={responsiveWidth(100) * 0.28}
            aspect_ratio={0.3}
            shadowRadius={2}
            borderRadius={4}
            fontSize={responsiveFontSize(1.8)}
            btPress={() => {
              ref_policyPopup.current.close();
              set_policyVersion('');
            }}
            style={{alignSelf: 'center'}}
          />
        </View>
      </AppModalBottomUp>
    </View>
  );
}

const InfoPill = ({text}) => <Text style={styles.info_pill}>{text}</Text>;

const RadioLabel =
  (item, is_reschedule, colorChecked, colorUnchecked, consultHappening, t) =>
  ({isActive = true}) =>
    (
      <View style={styles.radio_label}>
        <View style={styles.radio_label_row}>
          <Text
            style={{
              ...GetTextStyle(
                !is_reschedule && isActive ? colorChecked : colorUnchecked,
                2.2,
              ),
              marginRight: 5,
            }}>
            {item.consultTypeName}
          </Text>
          <MaterialCommunityIcons
            name={item.icon}
            style={GetTextStyle(
              !is_reschedule && isActive ? colorChecked : colorUnchecked,
              3,
            )}
          />
        </View>
        <Text style={GetTextStyle('#888888', 1.8)}>
          (Rs.{' '}
          {consultHappening === 1 ? item.fees_firstTime : item.fees_followUp})
        </Text>
      </View>
    );

const RenderSlot =
  (ref_slotPopup, selectedBlock, set_selectedBlock) =>
  ({item, index}) => {
    let margin_L = (responsiveWidth(100) - WIDTH) / 2;
    let first_item = !index ? {marginLeft: margin_L} : {};

    return (
      <View style={[styles.slot_wrapper, {width: WIDTH + 20}, first_item]}>
        <View style={styles.slot_content}>
          <Text style={GetTextStyle('#333333', 2.2, 'bold')}>
            {Day_dd_Mon_YYYY(new Date(item.date))}
          </Text>
          <Text style={[GetTextStyle('#999999', 1.6), {marginBottom: 10}]}>
            {item?.slots?.length} Slots available
          </Text>
          <View style={styles.slot_times}>
            {item?.slots.length
              ? item.slots.map((slot, i) =>
                  i < 5 ? (
                    <AppButtonSecondary
                      key={'slot-' + i}
                      isPressed={
                        item._id === selectedBlock?.date &&
                        slot.dateTime === selectedBlock?.slot
                      }
                      btPress={() =>
                        set_selectedBlock({date: item._id, slot: slot.dateTime})
                      }
                      btTitle={slot.blockStartTime}
                      width={responsiveWidth(100) * 0.22}
                      height={responsiveWidth(100) * 0.083}
                      borderRadius={6}
                      fontSize={responsiveFontSize(1.8)}
                      style={{marginRight: 10, marginBottom: 14}}
                    />
                  ) : i === 5 ? (
                    <AppButtonSecondary
                      key={'view-all' + i}
                      btPress={() => {
                        ref_slotPopup.current.open();
                        set_selectedBlock({
                          date: item._id,
                          slot: item.slots[0].dateTime,
                        });
                      }}
                      width={responsiveWidth(100) * 0.22}
                      height={responsiveWidth(100) * 0.083}
                      borderRadius={6}
                      style={{marginRight: 10, marginBottom: 14}}>
                      <View
                        style={{flexDirection: 'row', ...AppStyles.centerXY}}>
                        <Text
                          style={{
                            ...GetTextStyle('#0D6BC8', 1.6),
                          }}>
                          VIEW ALL
                        </Text>
                        <Image
                          style={{
                            width: 20,
                            resizeMode: 'contain',
                          }}
                          source={require('../assets/images/icon_chevron_next.png')}
                        />
                      </View>
                    </AppButtonSecondary>
                  ) : null,
                )
              : null}
          </View>
        </View>
        <View style={styles.slot_border}></View>
      </View>
    );
  };

const keyExtractor = (item, index) => 'day-' + index;

const NotAvailableBlock = ({text}) => (
  <View style={{flex: 1}}>
    <Text style={GetTextStyle('white', 2.6, undefined, 'center')}>{text}</Text>
  </View>
);

const Info_Section = ({
  children,
  image = require('../assets/images/no_image.png'),
  title = 'Title here...',
  style = {},
}) => (
  <View style={[styles.info_section, style]}>
    <View style={styles.info_img_wrap}>
      <AutoHeightImage width={responsiveWidth(100) * 0.05} source={image} />
    </View>
    <View style={styles.info_content}>
      <Text style={styles.info_title}>{title}</Text>
      {children && children}
    </View>
  </View>
);

const Info_Paras = ({data}) =>
  data.map((item, index) => {
    let text_style = data.length !== index + 1 ? {marginBottom: 7} : {};
    return (
      <Text
        key={'info-edu-' + index}
        style={[GetTextStyle('#888888', 1.85), text_style]}>
        {item.highestQualification}
      </Text>
    );
  });

const Clinic_Details = ({clinic, doctorId, btnAction}) => {
  const clinic_logo = clinic?.clinicLogo
    ? getFullUrl(clinic.clinicLogo, 'doctors/' + doctorId + '/')
    : null;
  const title = clinic?.clinicName || '';
  const clinicAddress =
    clinic?.clinicAddress ||
    '' + ' - ' + clinic?.clinicCity ||
    '' + ' - ' + clinic?.clinicState ||
    '' + ' - ' + clinic?.clinicPincode ||
    '';

  return (
    <View style={{flexDirection: 'row', marginTop: 15}}>
      <View style={styles.info_card_img_wrap}>
        {clinic_logo ? (
          <Image source={{uri: clinic_logo}} style={styles.info_card_image} />
        ) : (
          <ThumbPlaceholder
            style={{width: '100%'}}
            fName={'+'}
            lName={clinic?.clinicName}
          />
        )}
      </View>
      <View style={styles.info_card_ctn_wrap}>
        <Text style={[GetTextStyle('#888888', 1.9, 'bold'), {marginBottom: 3}]}>
          {title}
        </Text>
        <Text style={[GetTextStyle('#888888', 1.5, 'bold'), {marginBottom: 8}]}>
          {clinicAddress === undefined ? '' : clinicAddress}
        </Text>
        <AppButtonSecondary
          btTitle={'CALL NOW'}
          width={responsiveWidth(100) * 0.2}
          height={23}
          shadowRadius={2}
          borderRadius={6}
          btPress={btnAction}
        />
      </View>
    </View>
  );
};

const Unorder_List = ({data, showBullets = true}) => (
  <View>
    {data.map((item, index) => (
      <View
        key={'bullet-list-' + index}
        style={{flexDirection: 'row', alignItems: 'center'}}>
        {showBullets && <View style={styles.bullet_point}></View>}
        <Text style={GetTextStyle('#888888', 1.9)}>{item}</Text>
      </View>
    ))}
  </View>
);

const GalleryItem =
  (doctor_id, setIsLoading) =>
  ({item, index}) => {
    let _width = responsiveWidth(100) * 0.28;
    let margin_L = (responsiveWidth(100) - WIDTH) / 2;
    let first_item = !index ? {marginLeft: margin_L} : {};

    let gallery_image = getFullUrl(item?.image, 'doctors/' + doctor_id + '/');

    return (
      <View
        style={[
          styles.gallery_img_wrap,
          {width: _width + 14, aspectRatio: 5 / 3.4},
          first_item,
        ]}>
        <AppBoxShadow
          width={_width}
          aspect_ratio={3 / 5}
          borderRadius={5}
          content_style={AppStyles.centerXY}>
          {gallery_image ? (
            <TouchableWithoutFeedback
              onPress={() => viewImage(doctor_id, item?.image, setIsLoading)}>
              <Image style={styles.gallery_img} source={{uri: gallery_image}} />
            </TouchableWithoutFeedback>
          ) : (
            <Image
              style={styles.gallery_img}
              source={require('../assets/images/no_image.png')}
            />
          )}
        </AppBoxShadow>
      </View>
    );
  };

const GalleryKey = (item, index) => 'gallery-item-' + index;

function viewImage(doctor_id, imgName, setIsLoading) {
  setIsLoading(true);
  const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${imgName
    .split('.')
    .pop()}`;

  const options = {
    fromUrl: getFullUrl(imgName, 'doctors/' + doctor_id + '/'),
    toFile: localFile,
  };
  RNFS.downloadFile(options)
    .promise.then(() => FileViewer.open(localFile, {showOpenWithDialog: true}))
    .then(() => {
      console.log('file is viewed successfully...');
      setIsLoading(false);
    })
    .catch((error) => {
      console.log('File view error______ : ', error);
      setIsLoading(false);
    });
}

const Book_Fees_Row = ({rName, rValue, fWeight, showBullets = true}) => (
  <View style={styles.bk_fees_row}>
    {showBullets && <View style={styles.bk_fees_row_bullet}></View>}
    <Text style={styles.bk_fees_row_key(fWeight)}>{rName}</Text>
    <Text style={styles.bk_fees_row_value}>Rs. {rValue?.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  mainContainer: {
    paddingTop: 15,
    paddingBottom: 30,
  },
  content: {
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  card: {
    flex: 1,
    width: '90%',
    ...AppStyles.centerXY,
  },
  cd_thumb: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: THUMB_BORDER_RADIUS,
  },
  cd_title: {
    marginBottom: 5,
  },
  cd_sub_text: {
    ...GetTextStyle(undefined, 1.8),
    fontWeight: 'bold',
    marginRight: 8,
  },
  info_pill: {
    ...GetTextStyle('#2167C5', 1.6),
    textAlign: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 5,
  },
  cd_sub_text_2: {
    ...GetTextStyle(undefined, 1.6),
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  tab_head: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  tab_body: {},
  title_text: {
    ...GetTextStyle(undefined, 1.85),
    marginBottom: 12,
  },
  radio_wrap: {flexDirection: 'row'},
  radio_label_row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  radio_label: {
    marginLeft: 5,
  },
  slot_wrapper: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  slot_content: {
    flex: 1,
  },
  slot_border: {
    height: '100%',
    borderWidth: 1,
    borderColor: '#cdcdcd',
    borderStyle: 'dotted',
    borderRadius: 1,
    marginLeft: 0,
    marginRight: 25,
  },
  slot_times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selection_row: {
    flexDirection: 'row',
    ...AppStyles.centerXY,
  },
  info_section: {
    flexDirection: 'row',
  },
  info_img_wrap: {
    flexBasis: '10%',
    flexDirection: 'row',
  },
  info_content: {
    flexBasis: '90%',
  },
  info_title: {
    ...GetTextStyle('#333333', 1.9, 'bold'),
    marginBottom: 2,
  },
  info_card_img_wrap: {
    flexBasis: '25%',
    flexDirection: 'row',
    paddingRight: 5,
    alignSelf: 'flex-start',
    aspectRatio: 1 / 1,
  },
  info_card_image: {
    flexBasis: '90%',
    aspectRatio: 1 / 1,
    borderRadius: 10,
    marginTop: 3,
    backgroundColor: '#EBEBEB',
  },
  info_card_ctn_wrap: {
    flexBasis: '75%',
  },
  bullet_point: {
    width: 4,
    height: 4,
    backgroundColor: '#707070',
    borderRadius: 30,
    marginRight: 8,
  },
  info_map_wrap: {
    width: WIDTH,
    aspectRatio: 301 / 136,
    borderWidth: 1,
    borderColor: '#DCDFE1',
    borderRadius: 10,
    marginTop: 19,
    backgroundColor: 'white',
  },
  map_container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map_view: {
    ...StyleSheet.absoluteFillObject,
  },
  gallery_img_wrap: {
    ...AppStyles.centerXY,
  },
  gallery_img: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    resizeMode: 'contain',
  },
  no_data: {...GetTextStyle('#888888', 1.7)},
  booking_consult: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  form_control_wrap: {marginBottom: 22},
  inputField: {
    fontSize: responsiveFontSize(2.0),
  },
  img_picker_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  bk_submit: {
    width: responsiveWidth(100) * 0.56,
    alignSelf: 'center',
    marginBottom: 25,
  },
  footer: {
    flexShrink: 1,
    marginTop: 'auto',
    paddingHorizontal: 10,
  },
  footer_inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#357DD9',
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
  },
  policy_radio_label: {
    ...GetTextStyle(undefined, 1.85),
    marginLeft: 3,
  },
  policy_title: {
    ...GetTextStyle(undefined, 2.2, 'bold'),
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  policy_scroll: {
    width: responsiveWidth(100),
    alignSelf: 'center',
    paddingHorizontal: (responsiveWidth(100) - WIDTH) / 2,
  },
  policy_bt_group: {
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});
