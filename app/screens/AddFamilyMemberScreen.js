import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormSelect from '../components/AppFormSelect';
import AppInputAppend from '../components/AppInputAppend';
import AppFormRadio from '../components/AppFormRadio';
import AppFormRadioGroup from '../components/AppFormRadioGroup';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppFormButton from '../components/AppFormButton';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import AppStyles, {
  Container_Width,
  IsAndroid,
  GetTextStyle,
} from '../config/style';
import {dd_Mon_yyyy} from '../config/functions';
import AuthContext from '../auth/context';
import flyMemberApi from '../api/familyMember';
import relationshipsApi from '../api/relationships';
import {GENDERS, BLOOD_GROUPS} from '../screens/DoctorsData';
import simiraApi from '../api/simira';

const WIDTH = Container_Width;

export default function AddFamilyMemberScreen({route, navigation}) {
  const {user, setUser} = useContext(AuthContext);

  /* States */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [flyMember, set_flyMember] = useState({});
  const [currentDropdown, set_currentDropdown] = useState(0);
  const [relationShips, set_relationShips] = useState([]);
  const [isDatePicker, set_isDatePicker] = useState(false);
  const [dob, set_dob] = useState();
  const [dobError, set_dobError] = useState('');
  const [countryCode, set_countryCode] = useState('+91');
  const [genderList, set_genderList] = useState(GENDERS);
  const [bloodGroupList, set_bloodGroupList] = useState(BLOOD_GROUPS);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.FlyMemberId) {
        fetchFamilyMember(route.params.FlyMemberId);
      }
      fetchRelationships();
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (flyMember?._id) populateForm();
  }, [flyMember]);

  useEffect(() => {
    setRelationShip();
  }, [relationShips]);

  /* Async api calls */
  const fetchRelationships = async () => {
    setIsLoading(true);
    const resp = await relationshipsApi.getRelationships();
    if (resp?.ok) {
      if (resp?.data?.length) set_relationShips(resp.data);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Relationships',
      );
    }
    setIsLoading(false);
  };

  const fetchFamilyMember = async (_id) => {
    setIsLoading(true);
    const resp = await flyMemberApi.getFamilyMember(_id);
    if (resp?.ok) {
      if (resp?.data?._id) {
        let flymem = resp.data;
        flymem.phone = flymem?.phone
          ? flymem.phone.replace(countryCode, '')
          : flymem.phone;
        set_flyMember(flymem);
      }
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Famliy Member',
      );
    }
    setIsLoading(false);
  };

  /* Functions */
  function setRelationShip() {
    if (flyMember?.relation && relationShips?.length) {
      const relation = relationShips.find(
        (item) => item.name === flyMember.relation,
      );
      set_FormDataObject({...FormDataObject, relation});
    }
  }

  /* Select Dropdown */
  const openSelectDropdown = (dropdown) => {
    set_isScreenScrollable(false);
    set_currentDropdown(dropdown);
  };

  const closeSelectDropdown = (dropdown) => {
    set_isScreenScrollable(true);
    set_currentDropdown(dropdown);
  };

  /* Date Picker */
  const showDatePicker = () => {
    set_isDatePicker(true);
  };

  const hideDatePicker = () => {
    set_isDatePicker(false);
  };

  const handleDateConfirm = (date) => {
    set_dob(date);
    hideDatePicker();
  };

  /* Form */
  function getFormData() {
    return {
      relation: null,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      gender: '',
      bloodGroup: null,
    };
  }

  function populateForm() {
    let formObject = {...FormDataObject};
    copyObjectByKeys(flyMember, formObject);
    if (flyMember?.dob) set_dob(new Date(flyMember.dob));
    if (bloodGroupList?.length && flyMember?.bloodGroup) {
      formObject.bloodGroup = bloodGroupList.find(
        (bldgp) => bldgp.name === flyMember.bloodGroup,
      );
    }
    set_FormDataObject({...formObject});
  }

  function copyObjectByKeys(srcObj, destObj) {
    Object.keys(destObj).forEach(
      (key) => (destObj[key] = srcObj[key] ? srcObj[key] : destObj[key]),
    );
  }

  /* Form Validation Schema */
  const formSchema = Yup.object().shape({
    relation: Yup.object().nullable().required('Relation is required'),
    firstName: Yup.string()
      .required('First Name is required')
      .max(150, 'Maximum ${max} characters allowed'),
    lastName: Yup.string()
      .required('Last Name is required')
      .max(150, 'Maximum ${max} characters allowed'),
    phone: Yup.string().matches(
      /^[0]?[0-9]\d{9}$/,
      'Enter a valid mobile number.',
    ),
    email: Yup.string().email('Please enter a valid email'),
    gender: Yup.string().required('Gender is required'),
    bloodGroup: Yup.object().nullable(),
  });

  /* Reset Form */
  const resetForm = () => {
    set_FormDataObject(getFormData());
    set_flyMember({});
    set_dob();
    set_dobError('');
    setFormSubmitted(false);
    setError('');
  };

  /* Save Form Data */
  const saveFormData = async (data) => {
    setIsLoading(true);
    setFormSubmitted(true);
    try {
      let postPayload = JSON.parse(JSON.stringify(data));
      postPayload.userId = user._id;
      var mem = getFormData();
      var memberOutput = await simiraApi.addPatient({countryCode: "91", mobile: mem.phone, fullName: mem.firstName+" "+mem.lastName, email: mem.email, dob: mem.dob !== "" ? mem.dob.split("T")[0] : "", designation: mem.gender === "Male" ? "Mr." : "Ms.", age:"", gender: mem.gender, area: "", city: "", state: "", pincode: "", patientType: "IP"});
      console.log("NEW FAMILY MEMBER SASMIRA", memberOutput);
      postPayload.sasmiraPatientId = JSON.stringify(memberOutput)
      formatPayload(postPayload);
      postPayload.dob = appendDOB();

      if (postPayload.dob) {
        const resp = flyMember._id
          ? await flyMemberApi.updateFamilyMember(postPayload, flyMember._id)
          : await flyMemberApi.addFamilyMember(postPayload);
        if (resp?.ok) {
          if (resp?.data) navigation.goBack();
        } else
          setError(
            resp?.data?.errors?.[0]?.msg ||
              'Famliy Member Create / Update error',
          );
      }
    } catch (error) {
      console.log('Famliy Member Failed', error);
      setError('Server Error in Famliy Member');
    }
    setIsLoading(false);
    setFormSubmitted(false);
  };

  const formatPayload = (inputObj) => {
    inputObj.phone = inputObj.phone
      ? countryCode + inputObj.phone
      : inputObj.phone;
    inputObj.relation = inputObj.relation?.name;
    inputObj.bloodGroup = inputObj.bloodGroup?.name;
  };

  const appendDOB = () => {
    let bDate = false;
    bDate = dob ? dob : flyMember.dob;
    bDate ? set_dobError('') : set_dobError('Please select Birth Date');
    return bDate;
  };

  const deleteForm = () => {
    simpleAlert({
      title: 'Delete Family Member!',
      content: 'Confirm, if you want to delete this Family Member?',
      okText: 'Confirm',
      okCallback: deleteFlyMember,
      showCancel: true,
    });
  };

  async function deleteFlyMember() {
    const resp = await flyMemberApi.deleteFamilyMember(flyMember._id);
    if (resp?.ok) {
      if (resp?.data) navigation.goBack();
    } else
      setError(resp?.data?.errors?.[0]?.msg || 'Family Member delete error');
  }

  return (
    <View
      style={styles.mainContainer}
      onStartShouldSetResponderCapture={(event) => closeSelectDropdown(0)}>
      <LoadingIndicator visible={isLoading} />
      <ScreenScrollable
        scrollEnabled={isScreenScrollable}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>Add Family Member</AppHeading>
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <AppForm
            initialValues={FormDataObject}
            validationSchema={formSchema}
            onSubmit={saveFormData}>
            <View style={{marginBottom: 20}}>
              <AppFormSelect
                name="relation"
                data={relationShips}
                isOpen={currentDropdown === 1}
                openSelect={() => openSelectDropdown(1)}
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
              <AppInputAppend
                isAppend={true}
                appendWidth={responsiveWidth(7)}
                appendPadding={0}
                appendImageWidth={'65%'}
                appendSrc={require('../assets/images/icon_calendar.png')}
                inputPress={() => showDatePicker(true)}
                appendClick={() => showDatePicker(true)}
                placeholder={'Date of Birth'}
                value={dob && dd_Mon_yyyy(dob)}
                editable={false}
                keyboardType="default"
                fontSize={responsiveFontSize(2.0)}
                showMsg={Boolean(dobError)}
                error={dobError}
              />
              <DateTimePickerModal
                isVisible={isDatePicker}
                mode="date"
                value={dob}
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            <View style={{marginBottom: 20}}>
              <AppFormInput
                name="phone"
                keyboardType="default"
                placeholder="Mobile Number"
                style={styles.input_field}
              />
            </View>

            <View style={{marginBottom: 30}}>
              <AppFormInput
                name="email"
                keyboardType="email-address"
                placeholder={'Email Address'}
                style={styles.input_field}
              />
            </View>

            <AppFormRadioGroup
              name="gender"
              style={{
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

            <View style={{marginBottom: 40}}>
              <AppFormSelect
                name="bloodGroup"
                data={bloodGroupList}
                isOpen={currentDropdown === 2}
                openSelect={() => openSelectDropdown(2)}
                closeSelect={() => closeSelectDropdown(0)}
                optionLabel={'name'}
                place_holder_option="Select Blood Group"
                dp_max_height={responsiveWidth(100) * 0.6}
                is_drop_up={true}
              />
            </View>

            <AppFormButton
              btTitle={'SAVE'}
              style={{marginBottom: 24}}
              width={responsiveWidth(100) * 0.57}
              aspect_ratio={0.23}
              shadowRadius={2}
              textSize={responsiveFontSize(2.45)}
            />

            {flyMember._id ? (
              <AppButtonSecondary
                btTitle="DELETE"
                width={responsiveWidth(100) * 0.3}
                aspect_ratio={0.22}
                shadowRadius={2}
                borderRadius={4}
                fontSize={responsiveFontSize(1.5)}
                btPress={deleteForm}
              />
            ) : null}
          </AppForm>
        </View>
      </ScreenScrollable>
    </View>
  );
}

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
  input_field: {
    fontSize: responsiveFontSize(2.0),
  },
  radio_wrapper: {
    width: '100%',
    flexDirection: 'row',
  },
});
