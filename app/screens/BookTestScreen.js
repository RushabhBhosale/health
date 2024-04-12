import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  LogBox,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AutoHeightImage from 'react-native-auto-height-image';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormSelect from '../components/AppFormSelect';
import AppSelectInput from '../components/AppSelectInput';
import AppSearchSelectMulti from '../components/AppSearchSelectMulti';
import AppInputAppend from '../components/AppInputAppend';
import AppFormRadio from '../components/AppFormRadio';
import AppFormRadioGroup from '../components/AppFormRadioGroup';
import AppFormButton from '../components/AppFormButton';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import AppModalBottomUp from '../components/AppModalBottomUp';
import {DividerX} from '../components/AppCommonComponents';
import AppStyles, {
  Container_Width,
  IsAndroid,
  GetTextStyle,
} from '../config/style';
import {dd_Mon_yyyy, makeFullName} from '../config/functions';
import AuthContext from '../auth/context';
import relationshipsApi from '../api/relationships';
import flyMemberApi from '../api/familyMember';
import doctorsApi from '../api/doctors';
import thyrocareApi from '../api/thyrocare';
import simiraApi from '../api/simira';
import {GENDERS, BLOOD_GROUPS} from '../screens/DoctorsData';
import AppRadioInputPlus from '../components/AppRadioInputPlus';
// import {THYRO_CREDS, THYRO_PRODS} from '../screens/Thyro_Test_Data.js'

const WIDTH = Container_Width;
const RELATION_TYPES = ['Self', 'Others'];
let AreThyroTestsFetched = false;
let THYRO_TESTS_CACHED = [];
let SMIRA_TESTS_CACHED = [];

export default function BookTestScreen({route, navigation}) {
  const {user, setUser} = useContext(AuthContext);
  const ref_bottomPopup = useRef();

  /* States */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [thyroCreds, set_thyroCreds] = useState(setThyroCredentials('', ''));
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [currentDropdown, set_currentDropdown] = useState(0);
  const [relationTypeList, set_relationTypeList] = useState([]);
  const [selectedRelationType, set_selectedRelationType] = useState(null);
  const [familyMemberList, set_familyMemberList] = useState([]);
  const [familyMemberSet, set_familyMemberSet] = useState({});
  const [familyMemberFiltered, set_familyMemberFiltered] = useState([]);
  const [selectedFlyMember, set_selectedFlyMember] = useState(null);
  const [flyMemberError, set_flyMemberError] = useState('');
  const [relationShipList, set_relationShipList] = useState([]);
  const [isDatePicker, set_isDatePicker] = useState(0);
  const [dob, set_dob] = useState();
  const [dobError, set_dobError] = useState('');
  const [bloodGroupList, set_bloodGroupList] = useState(BLOOD_GROUPS);
  const [genderList, set_genderList] = useState(GENDERS);
  const [testList, set_testList] = useState(THYRO_TESTS_CACHED);
  const [selectedPathology, set_selectedPathology] = useState([]);
  const [selectedTests, set_selectedTests] = useState([]);
  const [searchTestxt, set_searchTestxt] = useState('');
  const [testsError, set_testsError] = useState('');
  const [city, set_city] = useState("");
  const [state, set_state] = useState("");
  const [isAppointment, set_isAppointment] = useState("home_visit");
  const [pincode, set_pincode] = useState(user?.pincode);
  const [slotDate, set_slotDate] = useState();
  const [sltDateError, set_sltDateError] = useState('');
  const [slotList, set_slotList] = useState([]);
  const [doctorList, set_doctorList] = useState([]);
  const [fees_amount, set_fees_amount] = useState(0);
  const [GST_cent, set_GST_cent] = useState(18);
  const [GST_amount, set_GST_amount] = useState(0);
  const [service_charges, set_service_charges] = useState(0);
  const [total_amount, set_total_amount] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [zipcode, setZipcode] = useState("");
  const [pin_check, setPinCheck] = useState(false);
  const [isSimiraAvailable, setSimiraAvailable] = useState(false);

  function resetStates() {
    set_thyroCreds(setThyroCredentials('', ''));
    set_FormDataObject(getFormData());
    set_testsError('');
    set_selectedPathology([]);
    set_selectedTests([]);
    set_pincode(user?.pincode);
    set_selectedRelationType(null);
    set_selectedFlyMember(null);
    set_flyMemberError('');
    set_dob();
    set_dobError('');
    set_slotDate();
    set_sltDateError('');
    set_fees_amount(0);
    set_GST_amount(0);
    set_total_amount(0);
    setFormSubmitted(false);
    setError('');
  }

  /* Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      //loginToThyrocare();
      /* set_thyroCreds(
        setThyroCredentials(THYRO_CREDS.apiKey, THYRO_CREDS.accessToken),
      ); */
      fetchFamilyMembers();
      fetchRelationships();
      fetchDoctors();
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useEffect(() => {
    if (thyroCreds.apiKey && thyroCreds.accessToken) {
      if (!AreThyroTestsFetched) {
        AreThyroTestsFetched = true;
        console.log("---> AT A DECISION <----"+isSimiraAvailable);
        if(isSimiraAvailable) {
          fetchSimiraTests();
        } else {
          fetchThyroTests();
        }
      }
    }
  }, [thyroCreds]);

  useEffect(() => {
    console.log("DATE CHANGED 0");
    if(isSimiraAvailable) {
      console.log("SIMIRA SLOTS");
      fetchSimiraSlots();
    } else {
      if (thyroCreds.apiKey && thyroCreds.accessToken) {
        console.log("DATE CHANGED 1");
        if (slotDate?.isSameOrAfter(moment().startOf('day'))) {
          console.log("DATE CHANGED 2");
          console.log("THYROCARE SLOTS");
          fetchThyroSlots();
        }
      }
    }
  }, [slotDate]);

  useEffect(() => {
    if (relationTypeList.length) set_selectedRelationType(relationTypeList[0]);
  }, [relationTypeList]);

  useEffect(() => {
    let relTypArr = [{name: RELATION_TYPES[0]}];
    if (familyMemberList.length) {
      relTypArr = relTypArr.concat(composeRelationType());
    }
    relTypArr.push({name: RELATION_TYPES[1]});
    set_relationTypeList(relTypArr);
  }, [familyMemberList]);

  useEffect(() => {
    const selRelTyp = selectedRelationType?.name;
    if (selRelTyp) {
      if (!RELATION_TYPES.includes(selRelTyp)) {
        set_familyMemberFiltered(familyMemberSet[selRelTyp]);
      } else {
        set_familyMemberFiltered([]);
      }
      set_selectedFlyMember(null);

      selRelTyp === RELATION_TYPES[1]
        ? toggleBookForOthers(true)
        : toggleBookForOthers(false);
    }
  }, [selectedRelationType]);

  useEffect(() => {
    computeBreakup();
  }, [selectedTests]);

  // useEffect(() => {
  //   checkAvailability();
  // }, [pin_check, zipcode]);

  /* Async api calls */
  const fetchFamilyMembers = async () => {
    setIsLoading(true);
    let fly_mem = [];
    try {
      const resp = await flyMemberApi.getUserFlyMembers(user._id);
      console.log("USER SELF:::", user);
      console.log("FAMILY MEMBERS:::", resp.data);
      if (resp?.ok) {
        if (resp?.data && resp?.data?.length)
          fly_mem = [
            ...trimArrayObjects(
              characterSort(resp.data, 'firstName', 'lastName'),
            ),
          ];
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching user family members',
        );
      }
    } catch (error) {
      console.log('flyMemberApi.getUserFlyMembers catch =>', error);
      setError(error?.message || 'Error in fetching user family members');
    }
    set_familyMemberList(fly_mem);
    setIsLoading(false);
  };

  /* Async api calls */
  const checkAvailability = async () => {
    setIsLoading(true);
    console.log("Pincode Request Received for "+zipcode);
    try {
      const resp = await simiraApi.findPincode(zipcode);
      console.log(resp);
      if (resp?.ok) {
        if(resp?.data?.msg === "Service Available") {
          setSimiraAvailable(true);
          await fetchSimiraTests();
          setPinCheck(true);
        }
      } else {
        await loginToThyrocare();
        setSimiraAvailable(false);
        setPinCheck(true);
      }
    } catch (error) {
      console.log('simiraApi.findPincode catch =>', error);
      setError(error?.message || 'Error in fetching availability');
    }
    setIsLoading(false);
  };

  function trimArrayObjects(inList) {
    return inList.map((item) => {
      item.full_name = makeFullName(item.firstName, item.lastName);
      return item;
    });
  }

  function characterSort(inArr, key1, key2) {
    const outArr = inArr.sort((a, b) => {
      let fa = (a[key1] + ' ' + a[key2]).toLowerCase(),
        fb = (b[key1] + ' ' + b[key2]).toLowerCase();
      return fa !== fb ? (fa < fb ? -1 : 1) : 0;
    });
    return outArr;
  }

  function composeRelationType() {
    let fmbr = null,
      flyMbrSet = {},
      flyMbrArr = [];
    if (familyMemberList.length) {
      for (let i = 0; i < familyMemberList.length; i++) {
        fmbr = familyMemberList[i];
        if (flyMbrSet.hasOwnProperty(fmbr.relation)) {
          flyMbrSet[fmbr.relation].push(fmbr);
        } else {
          flyMbrSet[fmbr.relation] = [fmbr];
        }
      }
      flyMbrArr = Object.keys(flyMbrSet)?.map((flm) => ({name: flm}));
    }
    set_familyMemberSet(flyMbrSet);
    return flyMbrArr;
  }

  const fetchRelationships = async () => {
    setIsLoading(true);
    let rel_list = [];
    try {
      const resp = await relationshipsApi.getRelationships();
      if (resp?.ok) {
        if (resp.data?.length) rel_list = resp.data;
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in fetching Relationships',
        );
      }
    } catch (error) {
      console.log('relationshipsApi.getRelationships catch =>', error);
      setError(error?.message || 'Error in fetching relationships');
    }
    set_relationShipList(rel_list);
    setIsLoading(false);
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    let doctr_list = [];
    try {
      const resp = await doctorsApi.getDoctorsForPathology();
      if (resp?.ok) {
        if (resp.data?.length) {
          doctr_list = resp.data.map(
            (doct) => (
              (doct.full_name = makeFullName(doct.firstName, doct.lastName)),
              doct
            ),
          );
        }
      } else {
        setError(resp?.data?.errors?.[0]?.msg || 'Error in fetching Doctors');
      }
    } catch (error) {
      console.log('doctorsApi.getDoctorsForPathology catch =>', error);
      setError(error?.message || 'Error in fetching doctors');
    }
    set_doctorList(doctr_list);
    setIsLoading(false);
  };

  const loginToThyrocare = async () => {
    setIsLoading(true);
    try {
      const resp = await thyrocareApi.doLogin();
      if (resp?.data?.apiKey && resp?.data?.accessToken) {
        set_thyroCreds(
          setThyroCredentials(resp.data.apiKey, resp.data.accessToken),
        );
      } else {
        set_thyroCreds(setThyroCredentials('', ''));
        setError('Thyrocare Login Failed!');
      }
    } catch (error) {
      console.log('thyrocareApi.doLogin catch =>', error);
      setError(error?.message || 'Error in Login to Thyrocare');
    }
    setIsLoading(false);
  };

  const fetchSimiraSlots = async () => {
    setIsLoading(true);
    let slot_list = [
      {id: '3', slotMasterId: '8', slot: '06:00 - 06:30'},
      {id: '4', slotMasterId: '8', slot: '06:30 - 07:00'},
      {id: '5', slotMasterId: '9', slot: '07:00 - 07:30'},
      {id: '6', slotMasterId: '9', slot: '07:30 - 08:00'},
      {id: '7', slotMasterId: '10', slot: '08:00 - 08:30'},
      {id: '8', slotMasterId: '10', slot: '08:30 - 09:00'},
      {id: '9', slotMasterId: '11', slot: '09:00 - 09:30'},
      {id: '10', slotMasterId: '11', slot: '09:30 - 10:00'},
      {id: '11', slotMasterId: '12', slot: '10:00 - 10:30'},
      {id: '12', slotMasterId: '12', slot: '10:30 - 11:00'},
      {id: '13', slotMasterId: '13', slot: '11:00 - 11:30'},
      {id: '14', slotMasterId: '13', slot: '11:30 - 12:00'}
    ];
    set_slotList(slot_list);
    setIsLoading(false);
  };

  const fetchThyroSlots = async () => {
    setIsLoading(true);
    let slot_list = [];
    const slot_payload = {
      apiKey: thyroCreds.apiKey,
      accessToken: thyroCreds.accessToken,
      Pincode: `${pincode}`,
      Date: slotDate.format('YYYY-MM-DD'),
    };
    try {
      const resp = await thyrocareApi.getAppointmentSlots(slot_payload);
      if (resp?.data?.respId === 'RES00001') {
        if (resp?.data?.lSlotDataRes?.length) {
          slot_list = resp?.data?.lSlotDataRes;
          setError('');
        } else slot_list = [];
      } else {
        slot_list = [];
        setError(resp?.data?.response);
      }
    } catch (error) {
      console.log('thyrocareApi.getAppointmentSlots catch =>', error);
      setError(error?.message || 'Error in fetching Thyro Slots');
    }
    console.log("SLOT LIST", slot_list);
    set_slotList(slot_list);
    setIsLoading(false);
  };

  const fetchSimiraTests = async () => {
    setIsLoading(true);
    set_testsError('Loading...');
    console.log("FETCHING SIMIRA TESTS!!");
    let test_list = [];
    try {
      const resp = await simiraApi.getProducts();
      console.log("SIMIRA RESPONSE", resp);
      if (resp?.ok) {
        const profile_tests = resp.data.profileTestList;
        console.log("SIMIRA TESTS", profile_tests);
        profile_tests.forEach((offer) => {
          if(offer.testList.length > 0) {
            test_list = test_list.concat(
              offer.testList.map((tst, i) => ({
                _id: tst.testCode + '-' + tst.testID,
                name: tst.testName,
                amount: tst.testAmount,
                value: tst,
              })));
          }
        });
        set_testsError('');
      } else {
        test_list = [];
        resp?.data?.response
          ? set_testsError(resp.data.response)
          : set_testsError(
              resp?.data?.errors?.[0]?.msg || 'Failed to fetch Simira Tests',
            );
      }
    } catch (error) {
      console.log('simiraApi.getProducts catch =>', error);
      set_testsError(error?.message || 'Error in fetching Simira Tests');
    }
    SMIRA_TESTS_CACHED = test_list;
    set_testList(test_list);
    setIsLoading(false);
  };

  const fetchThyroTests = async () => {
    setIsLoading(true);
    set_testsError('Loading...');
    let test_list = [];
    const test_payload = {
      apiKey: thyroCreds.apiKey,
      accessToken: thyroCreds.accessToken,
      ProductType: 'ALL',
    };
    console.log("THYROCARE", test_payload);
    try {
      const resp = await thyrocareApi.getProducts(test_payload);
      if (resp?.data?.respId === 'RES00001') {
        const {offer = [], profile = [], tests = []} = resp.data.master;
        test_list = test_list.concat(
          offer.map((tst, i) => ({
            _id: tst.code + '-' + i,
            name: tst.name,
            value: tst,
          })),
          profile.map((tst, i) => ({
            _id: tst.code + '-' + i,
            name: tst.name,
            value: tst,
          })),
          tests.map((tst, i) => ({
            _id: tst.code + '-' + i,
            name: tst.name,
            value: tst,
          })),
        );
        set_testsError('');
      } else {
        test_list = [];
        resp?.data?.response
          ? set_testsError(resp.data.response)
          : set_testsError(
              resp?.data?.errors?.[0]?.msg || 'Failed to fetch Thyro Tests',
            );
      }
    } catch (error) {
      console.log('thyrocareApi.getAppointmentSlots catch =>', error);
      set_testsError(error?.message || 'Error in fetching Thyro Tests');
    }
    THYRO_TESTS_CACHED = test_list;
    set_testList(test_list);
    setIsLoading(false);
  };

  /* Select Dropdown */
  const openSelectDropdown = (dropdown) => {
    set_isScreenScrollable(false);
    set_currentDropdown(dropdown);
  };

  const closeSelectDropdown = (dropdown) => {
    set_isScreenScrollable(true);
    set_currentDropdown(dropdown);
  };

  /* ===== Search ===== */
  const searchInputChanged = (text) => {
    let regExp = null;
    set_searchTestxt(text);
    if (text) {
      regExp = new RegExp(text, 'i');
      set_testList(
        [...THYRO_TESTS_CACHED].filter((item) => regExp.test(item.name)),
      );
    } else {
      set_testList(THYRO_TESTS_CACHED);
    }
  };

  const onSearchSubmit = () => {
    closeSelectDropdown(0);
  };

  const searchItemSelected = (srcItem) => {
    setSelectedTests(srcItem);
  };

  const setSelectedTests = (test) => {
    let _testInx = selectedPathology.indexOf(test._id);
    let selPath = [...selectedPathology];
    let selTest = [...selectedTests];
    if (_testInx === -1) {
      set_selectedPathology((selPath.push(test._id), selPath));
      set_selectedTests((selTest.push(test), selTest));
    } else {
      set_selectedPathology((selPath.splice(_testInx, 1), selPath));
      set_selectedTests((selTest.splice(_testInx, 1), selTest));
    }
  };

  /* Date Picker */
  const showDatePicker = (index) => {
    set_isDatePicker(index);
  };

  const hideDatePicker = () => {
    set_isDatePicker(0);
  };

  const handleDateConfirm = (date, dpIndex) => {
    if (dpIndex === 1) {
      set_dob(date);
    } else {
      set_slotDate(moment(date).startOf('day'));
    }
    hideDatePicker();
  };

  /* Functions */
  function setThyroCredentials(apiKey, accessToken) {
    return {apiKey, accessToken};
  }

  function computeBreakup() {
    let fees = selectedTests.length
      ? selectedTests.reduce((accum, item) => {
          if(isSimiraAvailable) {
            accum += parseFloat(item.amount);
          } else {
            if (item.value?.rate?.b2C) {
              accum += parseFloat(item.value.rate.b2C);
            }
          }
          return accum;
        }, 0)
      : 0;
    let gst = (fees * GST_cent) / 100;
    set_GST_amount(gst);
    set_fees_amount(fees);
    set_total_amount(fees + gst);
  }

  /* Form */
  function getFormData() {
    return {
      bookForOthers: false,
      isAppointment: false,
      relation: null,
      ...getPatientSchema(),
      address: '',
      state: state,
      city: city,
      pincode: user?.pincode,
      slotTime: null,
      doctor: null,
      user_notes: '',
    };
  }

  function getPatientSchema() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      bloodGroup: null,
      gender: '',
    };
  }

  /* Form Validation Schema */
  const formSchema = Yup.object().shape({
    bookForOthers: Yup.boolean(),
    isAppointment: Yup.boolean(),
    relation: Yup.object()
      .nullable()
      .when('bookForOthers', conditionalSchema('Relation is required')),
    firstName: Yup.string()
      .max(150, 'Maximum ${max} characters allowed')
      .when('bookForOthers', conditionalSchema('First Name is required')),
    lastName: Yup.string()
      .max(150, 'Maximum ${max} characters allowed')
      .when('bookForOthers', conditionalSchema('Last Name is required')),
    email: Yup.string().email('Please enter a valid email'),
    bloodGroup: Yup.object()
      .nullable()
      .when('bookForOthers', conditionalSchema('Blood Group is required')),
    gender: Yup.string().when(
      'bookForOthers',
      conditionalSchema('Gender is required'),
    ),
    address: Yup.string()
      .required('Sample collection address is required')
      .max(250, 'Maximum ${max} characters allowed'),
    city: Yup.string().max(100, 'Maximum $(max} characters allowed'),
    state: Yup.string().max(100, 'Maximum $(max} characters allowed'),
    pincode: Yup.string().matches(/^[1-9][0-9]{5}$/, 'Enter a valid Pincode.'),
    slotTime: Yup.object().nullable().required('Slot is required'),
    doctor: Yup.object().nullable(),
    user_notes: Yup.string().required('Provide some reason for test'),
  });

  function conditionalSchema(message) {
    return (dependencyVal, fieldSchema) => {
      return dependencyVal ? fieldSchema.required(message) : fieldSchema;
    };
  }

  function toggleBookForOthers(bookForOthers) {
    let formObject = {...FormDataObject};
    set_FormDataObject({...formObject, bookForOthers});
  }

  function toggleAppointment(isAppointment) {
    let formObject = {...FormDataObject};
    set_FormDataObject({...formObject, isAppointment});
  }

  /* Format Form Data */
  const bookTestSubmit = async (data) => {
    let postPayload = JSON.parse(JSON.stringify(data));
    if (!validateFamilyMember()) return;
    postPayload.bookForOthers && appendBirthDate(postPayload);
    appendBookingDate(postPayload);
    appendTests(postPayload);
    if (
      (postPayload.bookForOthers ? postPayload.dob : true) &&
      postPayload.appointmentDate &&
      postPayload.selectedTests.length
    ) {
      postPayload.isSimira = isSimiraAvailable;
      if(isAppointment) {
        postPayload.isAppointmentRequest = 1;
        postPayload.isHomecollection = 0;
      } else {
        postPayload.isAppointmentRequest = 0;
        postPayload.isHomecollection = 1;
      }
      if (postPayload.bookForOthers) {
        await createFamilyMember(postPayload);
      }
      formatPayload(postPayload);
      console.log('postPayload ------------------ ', postPayload);
      navigation.navigate('BookTestPayment', {
        BookTestData: JSON.stringify(postPayload),
      });
    }
  };

  function validateFamilyMember() {
    const selRelTyp = selectedRelationType?.name;
    if (selRelTyp && !RELATION_TYPES.includes(selRelTyp)) {
      if (selectedFlyMember?._id) {
        return clearFlyError();
      } else {
        set_flyMemberError('Select a Family Member');
        return false;
      }
    } else {
      return clearFlyError();
    }
  }

  function clearFlyError() {
    set_flyMemberError('');
    return true;
  }

  const appendBirthDate = (inputObj) => {
    inputObj.dob = dob;
    dob ? set_dobError('') : set_dobError('Please select Birth Date');
  };

  const appendBookingDate = (inputObj) => {
    if (slotDate && inputObj?.slotTime?.slot) {
      let timeStamps = inputObj.slotTime.slot
        .split('-')
        .map((item) => item.trim());
      let dateString =
        moment(slotDate).format('YYYY-MM-DD') + ' ' + timeStamps[0];
      inputObj.appointmentDate = moment(
        dateString,
        'YYYY-MM-DD hh:mm',
      ).toDate();
      set_sltDateError('');
    } else {
      inputObj.appointmentDate = null;
      set_sltDateError('Please select Slot Date');
    }
  };

  const appendTests = (inputObj) => {
    inputObj.selectedTests = selectedTests;
    selectedTests.length
      ? set_testsError('')
      : set_testsError('Please select Pathology Test');
  };

  const createFamilyMember = async (inputData) => {
    setIsLoading(true);
    const flyMemPayload = {
      userId: user._id,
      relation: inputData.relation?.name,
      firstName: inputData.firstName,
      lastName: inputData.lastName,
      email: inputData.email,
      dob: inputData.dob,
      gender: inputData.gender,
      bloodGroup: inputData.bloodGroup?.name,
    };
    try {
      const resp = await flyMemberApi.addFamilyMember(flyMemPayload);
      if (resp?.ok) {
        if (resp?.data?._id) {
          inputData.patientInfo = resp.data;
          inputData.patientId = resp.data._id;
          inputData.patient = resp.data._id;
        }
      } else
        setError(resp?.data?.errors?.[0]?.msg || 'Famliy Member Create error');
    } catch (err) {
      console.log('flyMemberApi.addFamilyMember catch =>', error);
      setError(error?.message || 'Error in creating family member');
    }
    setIsLoading(false);
  };

  function formatPayload(inputObj) {
    const selRelTyp = selectedRelationType?.name;
    let patient_info = {};
    if (!inputObj.bookForOthers) {
      patient_info = selRelTyp === RELATION_TYPES[0] ? user : selectedFlyMember;
      console.log("PATIENT INFO", patient_info);
      if (patient_info._id) {
        inputObj.patientInfo = patient_info;
        inputObj.patientId = patient_info._id;
        inputObj.patient = patient_info._id;
      }
    }
    inputObj.apiKey = thyroCreds.apiKey;
    inputObj.accessToken = thyroCreds.accessToken;
    inputObj.orderId = moment().unix().toString();
    inputObj.userId = user._id;
    inputObj.fees = fees_amount;
    inputObj.gst = GST_amount;
    inputObj.service_charges = service_charges;
    inputObj.amount = total_amount;
    inputObj.is_thyrocare = true;
    inputObj.consultTypeName = 'CC';
    inputObj.doctorId = inputObj.doctor?._id;
  }

  return (
    <View
      style={styles.mainContainer}
      onStartShouldSetResponderCapture={(event) => closeSelectDropdown(0)}>
      <AppForm
        initialValues={FormDataObject}
        validationSchema={formSchema}
        onSubmit={bookTestSubmit}>
        <LoadingIndicator visible={isLoading} />
        <ScreenScrollable
          scrollEnabled={isScreenScrollable}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <AppHeading>Book A Test</AppHeading>
            </View>

            {error !== '' && (
              <View>
                <AppErrorMessage showMsg={true} error={error} />
              </View>
            )}

            { (pin_check === false) ?
              <>
              <View style={{marginBottom: 40}}>
                <Text style={styles.section_label(15)}>Enter Pincode</Text>
                <AppFormInput
                  onValueChange={setZipcode}
                  name="pincode"
                  keyboardType="number-pad"
                  placeholder={'Pincode'}
                  style={styles.input_field}
                />
              </View>
              <AppButtonPrimary
                btTitle={'CHECK AVAILABILITY'}
                style={{alignSelf: 'flex-end'}}
                width={21 * 0.0262 * responsiveWidth(100)}
                height={responsiveWidth(100) * 0.094}
                aspect_ratio={1}
                shadowRadius={0}
                borderRadius={5}
                textSize={responsiveFontSize(1.7)}
                gradientBorderWidth={2}
                gradientColorArray={['#e5a818', '#e89e0b', '#eb9500']}
                btPress={() => checkAvailability()}
              />
              </>
            :
            <View style={{marginBottom: 0}}>
              <Text style={styles.section_label(15)}>Appointment for</Text>

              <View style={{marginBottom: 20}}>
                <AppSelectInput
                  data={relationTypeList}
                  isOpen={currentDropdown === 1}
                  openSelect={() => openSelectDropdown(1)}
                  closeSelect={() => closeSelectDropdown(0)}
                  optionLabel={'name'}
                  selectedOption={selectedRelationType}
                  set_selectedOption={set_selectedRelationType}
                  place_holder_option="Select Relation Type"
                  dp_max_height={responsiveWidth(100) * 0.6}
                />
              </View>

              { selectedRelationType?.name &&
              !RELATION_TYPES.includes(selectedRelationType.name) ? (
                <View style={{marginBottom: 20}}>
                  <AppSelectInput
                    data={familyMemberFiltered}
                    isOpen={currentDropdown === 2}
                    openSelect={() => openSelectDropdown(2)}
                    closeSelect={() => closeSelectDropdown(0)}
                    optionLabel={'full_name'}
                    selectedOption={selectedFlyMember}
                    set_selectedOption={set_selectedFlyMember}
                    place_holder_option="Select Family Member"
                    dp_max_height={responsiveWidth(100) * 0.6}
                    showMsg={Boolean(flyMemberError)}
                    error={flyMemberError}
                  />
                </View>
              ) : null }
            </View>
            }
            
            { (pin_check === true) ?
              <>
            { selectedRelationType?.name &&
            selectedRelationType.name === RELATION_TYPES[1] ? (
              <>
                <View style={{marginBottom: 20}}>
                  <AppFormSelect
                    name="relation"
                    data={relationShipList}
                    isOpen={currentDropdown === 3}
                    openSelect={() => openSelectDropdown(3)}
                    closeSelect={() => closeSelectDropdown(0)}
                    optionLabel={'name'}
                    place_holder_option="Select Relationship"
                    dp_max_height={responsiveWidth(100) * 0.6}
                  />
                </View>

                <View style={{marginBottom: 20}}>
                  <AppFormInput
                    name="firstName"
                    keyboardType="default"
                    placeholder="First Name"
                    style={styles.input_field}
                  />
                </View>

                <View style={{marginBottom: 20}}>
                  <AppFormInput
                    name="lastName"
                    keyboardType="default"
                    placeholder="Last Name"
                    style={styles.input_field}
                  />
                </View>

                <View style={{marginBottom: 20}}>
                  <AppFormInput
                    name="email"
                    keyboardType="email-address"
                    placeholder={'Email Address'}
                    style={styles.input_field}
                  />
                </View>

                <View style={{marginBottom: 20}}>
                  <AppInputAppend
                    isAppend={true}
                    appendWidth={responsiveWidth(7)}
                    appendPadding={0}
                    appendImageWidth={'65%'}
                    appendSrc={require('../assets/images/icon_calendar.png')}
                    inputPress={() => showDatePicker(1)}
                    appendClick={() => showDatePicker(1)}
                    placeholder={'Date of Birth'}
                    value={dob && dd_Mon_yyyy(dob)}
                    editable={false}
                    keyboardType="default"
                    fontSize={responsiveFontSize(2.0)}
                    showMsg={Boolean(dobError)}
                    error={dobError}
                  />
                </View>

                <View style={{marginBottom: 30}}>
                  <AppFormSelect
                    name="bloodGroup"
                    data={bloodGroupList}
                    isOpen={currentDropdown === 4}
                    openSelect={() => openSelectDropdown(4)}
                    closeSelect={() => closeSelectDropdown(0)}
                    optionLabel={'name'}
                    place_holder_option="Select Blood Group"
                    dp_max_height={responsiveWidth(100) * 0.6}
                  />
                </View>

                <AppFormRadioGroup
                  name="gender"
                  style={{
                    marginBottom: 0,
                    width: '100%',
                  }}>
                  <View style={styles.radio_wrapper}>
                    {genderList?.length &&
                      genderList.map((value, index) => {
                        return (
                          <AppFormRadio
                            key={'gender-' + index}
                            name="gender"
                            RdLabel={value}
                            radioId={value}
                            checkedRadio={''}
                            colorChecked={AppStyles.colors.blue}
                            wrapperStyle={!index ? {marginRight: 30} : {}}
                          />
                        );
                      })}
                  </View>
                </AppFormRadioGroup>
              </>
            ) : null }
            </> : null }

            { (pin_check === true) ?
              <>
              { isSimiraAvailable ? 
            <AppFormRadioGroup
              name="test_how"
              style={{
                marginBottom: 20,
                width: '100%',
              }}>
              <View style={styles.radio_wrapper}>
                <AppFormRadio
                  key={'test-labvisit'}
                  name="test_how"
                  RdLabel={"Lab Visit"}
                  radioId={"lab_visit"}
                  checkedRadio={''}
                  colorChecked={AppStyles.colors.blue}
                  wrapperStyle={{marginRight: 30}}
                  onValueChange={set_isAppointment}
                />
                <AppFormRadio
                  key={'test-homevisit'}
                  name="test_how"
                  RdLabel={"Home Visit"}
                  radioId={"home_visit"}
                  checkedRadio={''}
                  colorChecked={AppStyles.colors.blue}
                  wrapperStyle={{}}
                  onValueChange={set_isAppointment}
                />
              </View>
            </AppFormRadioGroup>
            : null }
            
            <View style={{marginBottom: 20}}>
              <AppSearchSelectMulti
                isDisabled={!Boolean(testList.length)}
                data={testList}
                isOpen={currentDropdown === 5}
                openSelect={() => openSelectDropdown(5)}
                searchText={searchTestxt}
                optionLabel={'name'}
                optionKey={'_id'}
                selectedItems={selectedPathology}
                itemSelected={searchItemSelected}
                inputFocused={() => openSelectDropdown(5)}
                inputChanged={searchInputChanged}
                searchButtonPressed={() => openSelectDropdown(5)}
                onSubmitEditing={onSearchSubmit}
                place_holder="Search Test"
                dpCaptionText="Select Test"
                dp_max_height={responsiveWidth(100) * 0.5}
                showMsg={Boolean(testsError)}
                error={testsError}
              />
            </View>
            <View style={styles.tests_wrapper}>
              {selectedTests.length
                ? selectedTests.map((item, index) => (
                    <TestItem
                      key={item._id}
                      item={item}
                      itemSelected={setSelectedTests}
                    />
                  ))
                : null}
            </View>
            </>
            : null }

            { (pin_check === true) ?
              <>
              {
                ((isSimiraAvailable && isAppointment=="home_visit") || !isSimiraAvailable) ?
                <View style={{marginBottom: 20}}>
                  <Text style={styles.section_label(15)}>
                    Address to Collect Sample {isSimiraAvailable ? "By Simira" : "By Thyrocare"}
                  </Text>
                  <AppFormInput
                    name="address"
                    keyboardType="default"
                    placeholder={'Enter Address'}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    aspect_ratio={0.48}
                    style={styles.input_field}
                  />
                </View>
                : null
              }

            {
            ((isSimiraAvailable && isAppointment=="home_visit") || !isSimiraAvailable) ?
            <View style={{marginBottom: 20}}>
              <Text style={styles.section_label(15)}>City</Text>
              <AppFormInput
                onValueChange={set_city}
                name="city"
                keyboardType="default"
                placeholder={''}
                style={styles.input_field}
              />
            </View>
            : null }

            {
            ((isSimiraAvailable && isAppointment=="home_visit") || !isSimiraAvailable) ?
            <View style={{marginBottom: 20}}>
              <Text style={styles.section_label(15)}>State</Text>
              <AppFormInput
                onValueChange={set_state}
                name="state"
                keyboardType="default"
                placeholder={''}
                style={styles.input_field}
              />
            </View>
            : null }

            <View style={{marginBottom: 20}}>
              <Text style={styles.section_label(15)}>Pincode</Text>
              <AppFormInput
                onValueChange={set_pincode}
                name="pincode"
                keyboardType="number-pad"
                placeholder={'Pincode'}
                style={styles.input_field}
              />
            </View>

            <View style={{marginBottom: 40}}>
              <Text style={styles.section_label(15)}>Available slots</Text>
              <AppInputAppend
                isAppend={true}
                appendWidth={responsiveWidth(7)}
                appendPadding={0}
                appendImageWidth={'65%'}
                appendSrc={require('../assets/images/icon_calendar1.png')}
                inputPress={() => showDatePicker(2)}
                appendClick={() => showDatePicker(2)}
                placeholder={'Select Date'}
                value={slotDate && dd_Mon_yyyy(slotDate.toDate())}
                editable={false}
                keyboardType="default"
                fontSize={responsiveFontSize(2.0)}
                showMsg={Boolean(sltDateError)}
                error={sltDateError}
              />
            </View>
            <DateTimePickerModal
              isVisible={Boolean(isDatePicker)}
              mode="date"
              onConfirm={(date) => handleDateConfirm(date, isDatePicker)}
              onCancel={hideDatePicker}
              minimumDate={isDatePicker === 2 ? new Date() : null}
            />
            </> : null }

            { (pin_check === true) ?
              <>
            <View style={{marginBottom: 40}}>
              <AppFormSelect
                isDisabled={!Boolean(slotDate)}
                name="slotTime"
                data={slotList}
                isOpen={currentDropdown === 6}
                openSelect={() => openSelectDropdown(6)}
                closeSelect={() => closeSelectDropdown(0)}
                optionLabel={'slot'}
                place_holder_option="Select Time"
                dp_max_height={responsiveWidth(100) * 0.6}
                noDataText={'No slots available for the selected date'}
              />
            </View>

            <View style={{marginBottom: 40}}>
              <Text style={styles.section_label(15)}>
                Select Doctor who prescribed the Test
              </Text>
              <AppFormSelect
                name="doctor"
                data={doctorList}
                isOpen={currentDropdown === 7}
                openSelect={() => openSelectDropdown(7)}
                closeSelect={() => closeSelectDropdown(0)}
                optionLabel={'full_name'}
                place_holder_option="Select Doctor"
                dp_max_height={responsiveWidth(100) * 0.6}
              />
            </View>

            <View style={{marginBottom: 0}}>
              <Text style={styles.section_label(15)}>
                Reasons for Test Booking
              </Text>
              <AppFormInput
                name="user_notes"
                keyboardType="default"
                placeholder={'Patients reason for test booking'}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                aspect_ratio={0.48}
                style={styles.input_field}
              />
            </View>
            </>
            : null }
          </View>
        </ScreenScrollable>

        { (pin_check === true) ?
              <>
        <View style={styles.footer}>
          <View style={styles.footer_inner}>
            <View style={{flexShrink: 1}}>
              <Text style={GetTextStyle('#ffffff', 1.9)}>Fees</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={GetTextStyle('#ffffff', 3, 'bold')}>
                  Rs. {fees_amount.toFixed(0)}
                </Text>
                <Text style={GetTextStyle('#ffffff', 1.5)}> +GST</Text>
              </View>
              <TouchableWithoutFeedback
                onPress={() => ref_bottomPopup.current.open()}>
                <Text style={GetTextStyle('#B1DFFE', 1.5)}>View Breakup</Text>
              </TouchableWithoutFeedback>
            </View>

            <View style={{flexShrink: 1}}>
              <AppFormButton
                ButtonElement={({btPress}) => (
                  <AppButtonSecondary
                    isDisabled={false}
                    btTitle={'BOOK A TEST'}
                    width={responsiveWidth(100) * 0.4}
                    height={responsiveWidth(100) * 0.1}
                    shadowRadius={3}
                    borderRadius={8}
                    shadow01Color={'#5AA2FF'}
                    shadow02Color={'#124789'}
                    shadow01Offset={{width: 3, height: 3}}
                    fontSize={responsiveFontSize(2.1)}
                    btPress={btPress}
                  />
                )}
              />
            </View>
          </View>
        </View>
        <AppModalBottomUp ref={ref_bottomPopup} height={320}>
          <View style={{marginBottom: 30}}>
            <Text
              style={[
                GetTextStyle(undefined, 2.2, 'bold'),
                {marginBottom: 14},
              ]}>
              Fees Breakup
            </Text>
            <Book_Fees_Row
              rName="Consultation"
              rValue={fees_amount}
              showBullets={false}
            />
            <Book_Fees_Row
              rName="Service Charges"
              rValue={service_charges}
              showBullets={false}
            />
            <Book_Fees_Row
              rName="GST"
              rValue={GST_amount}
              showBullets={false}
            />
            <DividerX style={{marginTop: 5, marginBottom: 12}} />
            <Book_Fees_Row
              rName="Total Fees"
              rValue={total_amount}
              fWeight="bold"
              showBullets={false}
            />
          </View>

          <AppFormButton
            ButtonElement={({btPress}) => (
              <AppButtonPrimary
                isDisabled={false}
                width={responsiveWidth(100) * 0.6}
                btTitle={'BOOK A TEST'}
                aspect_ratio={0.21}
                style={{alignSelf: 'center'}}
                btPress={() => {
                  ref_bottomPopup.current.close();
                  btPress();
                }}
              />
            )}
          />
        </AppModalBottomUp>
        </> : null }
      </AppForm>
    </View>
  );
}

const TestItem = ({item, itemSelected}) => {
  return (
    <View style={styles.test_itm_wrap}>
      <Text style={styles.test_itm_txt}>{item.name}</Text>
      <TouchableOpacity onPress={() => itemSelected(item)}>
        <View style={styles.test_itm_remove}>
          <AutoHeightImage
            width={12}
            source={require('../assets/images/close_icon.png')}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Book_Fees_Row = ({rName, rValue, fWeight, showBullets = true}) => (
  <View style={styles.bk_fees_row}>
    {showBullets && <View style={styles.bk_fees_row_bullet}></View>}
    <Text style={styles.bk_fees_row_key(fWeight)}>{rName}</Text>
    <Text style={styles.bk_fees_row_value}>Rs. {rValue?.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: IsAndroid ? 30 : 80,
    marginBottom: 30,
  },
  header: {
    flexShrink: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  sub_header: {
    flexShrink: 1,
    width: '80%',
    marginBottom: 15,
  },
  sub_title: {
    fontSize: responsiveFontSize(1.9),
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  section_label: (marginBottom) => ({
    ...GetTextStyle('#555555', 1.8, 'bold'),
    marginBottom,
  }),
  input_field: {
    fontSize: responsiveFontSize(2.0),
  },
  radio_wrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  tests_wrapper: {marginBottom: 30, alignSelf: 'stretch'},
  test_itm_wrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  test_itm_txt: {
    ...GetTextStyle(AppStyles.colors.blue, 1.85, undefined, 'left'),
  },
  test_itm_remove: {
    backgroundColor: 'transparent',
    width: 26,
    height: '100%',
    marginRight: -10,
    ...AppStyles.centerXY,
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
    ...GetTextStyle(undefined, 2, fWeight),
  }),
  bk_fees_row_value: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2, 'bold'),
    marginLeft: 'auto',
  },
});
