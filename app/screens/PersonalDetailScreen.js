import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import ScreenScrollable from '../components/ScreenScrollable';
import AppForm from '../components/AppForm';
import AppInputAppend from '../components/AppInputAppend';
import AppHeading from '../components/AppHeading';
import AppProgresStep from '../components/AppProgresStep';
import AppText from '../components/AppText';
import AppFormInput from '../components/AppFormInput';
import AppFormButton from '../components/AppFormButton';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppFormRadio from '../components/AppFormRadio';
import AppFormRadioGroup from '../components/AppFormRadioGroup';
import AppFormSelect from '../components/AppFormSelect';
import ImagePickerControlPrompt from '../components/ImagePickerControlPrompt';
import LoadingIndicator from '../components/LoadingIndicator';
import {formatDateObject, getFullUrl} from '../config/functions';
import AppStyles, {
  Container_Width,
  GetTextStyle,
  IsAndroid,
} from '../config/style';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AppErrorMessage from '../components/AppErrorMessage';
import AuthContext from '../auth/context';
import uploadsApi from '../api/uploads';
import usersApi from '../api/users';
import useAuth from '../auth/useAuth';
import {GENDERS, BLOOD_GROUPS} from '../screens/DoctorsData';

const WIDTH = Container_Width;

export default function PersonalDetailScreen({route, navigation}) {
  const {number, redirect} = route.params;
  const auth = useAuth();
  const {user, setUser} = useContext(AuthContext);

  /* State Variables */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [currentDropdown, set_currentDropdown] = useState(0);
  const [bloodGroups, set_bloodGroups] = useState(BLOOD_GROUPS);
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [formState, changeFormState] = useState(false);
  const [genderList, set_genderList] = useState(GENDERS);
  const [dob, set_dob] = useState();
  const [dobError, set_dobError] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const year18Ago = new Date().getFullYear() - 18;
  const date18Ago = new Date().setFullYear(year18Ago);
  const [profileImage, set_profileImage] = useState({uri: ''});
  const [profImgSelected, set_profImgSelected] = useState(false);

  /* Side Effects */
  useEffect(() => {
    if (user._id) populateForm();
  }, [user]);

  /* Functions */
  const profileImageSelected = (imgObj) => {
    set_profImgSelected(true);
    set_profileImage(imgObj);
  };

  /* Date Picker */
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    set_dob(date);
    hideDatePicker();
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

  /* Personal Details Form */
  function getFormData() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      height: '',
      weight: '',
      bloodGroup: null,
      pincode: '',
    };
  }

  function populateForm() {
    let formObject = {...FormDataObject};
    copyObjectByKeys(user, formObject);
    if (user.bloodGroup)
      formObject.bloodGroup = bloodGroups.find(
        (item) => item.name === user.bloodGroup,
      );
    if (user.dob) set_dob(new Date(user.dob));
    if (user.avtar) set_profileImage({uri: user.avtar});
    if (!user.dob && !user.avtar) changeFormState(true);
    set_FormDataObject({...formObject});
  }

  function copyObjectByKeys(srcObj, destObj) {
    Object.keys(destObj).forEach(
      (key) => (destObj[key] = srcObj[key] ? srcObj[key] : destObj[key]),
    );
  }

  /* Form Validation Schema */
  const userDataSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('First Name is required')
      .max(150, 'Maximum ${max} characters allowed'),
    lastName: Yup.string()
      .required('Last Name is required')
      .max(150, 'Maximum ${max} characters allowed'),
    email: Yup.string().email('Please enter a valid email'),
    gender: Yup.string().required('Gender is required'),
    height: Yup.number()
      .required('Height is required')
      .typeError('Only numeric value allowed')
      .integer('Only integer value allowed')
      .positive('Please enter positive value')
      .lessThan(300, 'Should be less than ${less}')
      .moreThan(50, 'Should be more than ${more}'),
    weight: Yup.number()
      .required('Weight is required')
      .typeError('Only numeric value allowed')
      .integer('Only integer value allowed')
      .positive('Please enter positive value')
      .lessThan(300, 'Should be less than ${less}')
      .moreThan(5, 'Should be more than ${more}'),
    bloodGroup: Yup.object().nullable().required('Blood Group is required'),
    pincode: Yup.string()
      .required('Pincode is required')
      .matches(/^[1-9][0-9]{5}$/, 'Enter a valid Pincode.'),
  });

  const saveUserData = async (data) => {
    setIsLoading(true);
    try {
      let updatePayload = formateFormData(JSON.stringify(data));
      updatePayload.dob = appendDOB();
      updatePayload = {...updatePayload, ...(await saveProfileImage())};

      if (updatePayload.dob) {
        const resp = await usersApi.register(updatePayload, number);
        if (resp?.ok) {
          if (resp?.data) {
            if (redirect === 'register') {
              navigation.navigate('Congrats', {userData: resp.data});
            } else if (redirect === 'dashboard') {
              await auth.profile(resp.data);
              navigation.navigate('Dashboard');
            } else {
              await auth.profile(resp.data);
              navigation.goBack();
            }
          }
        } else {
          setError(resp?.data?.errors?.[0]?.msg || 'Error in user register');
        }
      }
    } catch (error) {
      console.error('Error in user register', error);
      setError(error || 'Error in user register');
    }
    setIsLoading(false);
  };

  function formateFormData(dataIn) {
    dataIn = JSON.parse(dataIn);
    return {
      ...dataIn,
      bloodGroup: dataIn.bloodGroup?.name,
    };
  }

  const appendDOB = () => {
    let bDate = false;
    bDate = dob ? dob : user?.dob;
    bDate ? set_dobError('') : set_dobError('Please select Birth Date');
    return bDate;
  };

  const saveProfileImage = async () => {
    let profileResp = {avtar: profileImage.uri};
    if (profImgSelected) {
      try {
        const form_data = new FormData();
        form_data.append('profile_image', {
          name: profileImage.fileName,
          type: profileImage.type,
          uri: IsAndroid
            ? profileImage.uri
            : profileImage.uri.replace('file://', ''),
        });
        const resp = await uploadsApi.uploadFiles(form_data);
        if (resp?.ok) {
          if (resp?.data?.length)
            profileResp = {
              avtar: resp.data[0]?.fileName,
              profileImage_move: resp.data,
            };
        } else setError(resp?.data?.errors?.[0]?.msg || 'Image upload error');
      } catch (error) {
        console.log('Image upload error', error);
        setError(error.message || 'Image upload error');
      }
    }
    return profileResp;
  };

  return (
    <View
      style={styles.mainContainer}
      onStartShouldSetResponderCapture={(event) => closeSelectDropdown(0)}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.header}>
        <AppProgresStep
          isFirstDone={true}
          isSecondDone={true}
          colorDone={AppStyles.colors.oliveGreen}
          stepDots={6}
        />
      </View>
      <ScreenScrollable
        style={styles.scrollContainer}
        scrollEnabled={isScreenScrollable}
        keyboardShouldPersistTaps="handled">
        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.content}>
          <AppForm
            initialValues={FormDataObject}
            validationSchema={userDataSchema}
            onSubmit={saveUserData}>
            <View style={styles.row}>
              <AppHeading style={styles.headingText}>
                Add Personal Details
              </AppHeading>
              <AppText style={styles.subText}>
                Enter your personal details which help us provide you
                recommendations
              </AppText>
              <View style={styles.marginB_lg}>
                <AppFormInput
                  name="firstName"
                  keyboardType="default"
                  placeholder={'First Name'}
                  style={styles.inputField}
                />
              </View>
              <View style={styles.marginB_lg}>
                <AppFormInput
                  name="lastName"
                  keyboardType="default"
                  placeholder={'Last Name'}
                  style={styles.inputField}
                />
              </View>
              <View style={styles.marginB_lg}>
                <AppFormInput
                  name="email"
                  keyboardType="email-address"
                  placeholder={'Email Address'}
                  style={styles.inputField}
                />
              </View>
              <View style={styles.marginB_lg}>
                <AppInputAppend
                  isAppend={true}
                  appendWidth={responsiveWidth(7)}
                  appendPadding={0}
                  appendImageWidth={'65%'}
                  appendSrc={require('../assets/images/icon_calendar1.png')}
                  inputPress={() => showDatePicker(true)}
                  appendClick={() => showDatePicker(true)}
                  placeholder={'Date of Birth'}
                  value={dob && formatDateObject(dob)}
                  editable={false}
                  keyboardType="default"
                  fontSize={responsiveFontSize(2.0)}
                  style={styles.inputField}
                  showMsg={Boolean(dobError)}
                  error={dobError}
                />
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  value={dob}
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                  maximumDate={new Date(date18Ago)}
                />
              </View>
            </View>

            <AppFormRadioGroup name="gender">
              <View style={styles.content_row}>
                {genderList &&
                  genderList.length &&
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

            <View style={{...styles.content_row, ...styles.marginB_lg}}>
              <View
                style={{
                  flex: 1,
                }}>
                <AppFormInput
                  name="height"
                  keyboardType="number-pad"
                  placeholder={'Height (cms)'}
                  aspect_ratio={0.48}
                  style={styles.inputField_2}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                }}>
                <AppFormInput
                  name="weight"
                  keyboardType="number-pad"
                  placeholder={'Weight (kg)'}
                  aspect_ratio={0.48}
                  style={styles.inputField_2}
                />
              </View>
            </View>

            <View style={styles.marginB_lg}>
              <AppFormSelect
                name="bloodGroup"
                data={bloodGroups}
                isOpen={currentDropdown === 1}
                openSelect={() => openSelectDropdown(1)}
                closeSelect={() => closeSelectDropdown(0)}
                optionLabel={'name'}
                place_holder_option="Select Blood Group"
                dp_max_height={responsiveWidth(100) * 0.6}
              />
            </View>

            <View style={styles.marginB_xl}>
              <AppFormInput
                name="pincode"
                keyboardType="number-pad"
                placeholder={'Pincode'}
                style={styles.inputField}
              />
            </View>

            <View style={[styles.img_picker_wrap, styles.marginB_xl]}>
              <AppText style={styles.img_picker_text}>Add Image</AppText>
              <ImagePickerControlPrompt
                pickedImage={{
                  uri: profImgSelected
                    ? profileImage.uri
                    : getFullUrl(
                        profileImage.uri,
                        'patients/' + user?._id + '/',
                      ),
                }}
                imagePicked={profileImageSelected}
                _width={responsiveWidth(100) * 0.24}
                aspect_ratio={0.75}
              />
            </View>

            <View style={styles.footer}>
              <AppFormButton
                btTitle={'SAVE'}
                style={{alignSelf: 'center', ...styles.marginB}}
              />
              {redirect === 'register' ? null : (
                <AppButtonSecondary
                  btTitle={'SKIP FOR NOW'}
                  style={{alignSelf: 'center', ...styles.marginB_xxxl}}
                  width={responsiveWidth(30)}
                  height={28}
                  btPress={() => navigation.navigate('Dashboard')}
                />
              )}
            </View>
          </AppForm>
        </View>
      </ScreenScrollable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: AppStyles.colors.lightgrey,
    flex: 1,
  },
  header: {
    width: '100%',
    flexShrink: 1,
    zIndex: 1,
    backgroundColor: AppStyles.colors.lightgrey,
    paddingVertical: 30,
  },
  scrollContainer: {},
  content: {
    flex: 1,
    alignItems: 'center',
  },
  row: {
    width: WIDTH,
    alignItems: 'center',
  },
  content_row: {
    width: WIDTH,
    flexDirection: 'row',
  },
  headingText: {
    marginBottom: responsiveHeight(3),
  },
  subText: {
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
    width: '80%',
  },
  inputField: {
    width: WIDTH,
    fontSize: responsiveFontSize(2.0),
  },
  inputField_2: {
    width: WIDTH / 2 - 10,
    fontSize: responsiveFontSize(2.0),
  },
  img_picker_wrap: {
    width: WIDTH,
  },
  img_picker_text: {
    ...GetTextStyle(undefined, 1.8),
    marginBottom: 15,
  },
  footer: {
    marginTop: 'auto',
    width: WIDTH,
  },
  footerText: {
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
  },
  marginB: {
    marginBottom: responsiveHeight(2.5),
  },
  marginB_lg: {
    marginBottom: responsiveHeight(4),
  },
  marginB_xl: {
    marginBottom: responsiveHeight(6),
  },
  marginB_xxl: {
    marginBottom: responsiveHeight(7),
  },
  marginB_xxxl: {
    marginBottom: responsiveHeight(10),
  },
});
