import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
    responsiveWidth,
    responsiveFontSize,
  } from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import contactUsApi from '../api/contactUs';
import AutoHeightImage from 'react-native-auto-height-image';
import ScreenScrollable from '../components/ScreenScrollable';
import AppForm from '../components/AppForm';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppSelectInput from '../components/AppSelectInput';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import AppStyles, {
  GetTextStyle,
  IsAndroid,
  Container_Width,
} from '../config/style';
import AuthContext from '../auth/context';

const WIDTH = Container_Width;

export default function InsuranceFormScreen({navigation}) {
  const {user, setUser} = useContext(AuthContext);
  const [ success, set_success ] = useState(false);
  const [contactUsData, set_contactUsData] = useState();
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDropdown, set_currentDropdown] = useState(6);
  const [lookingFor, set_lookingFor] = useState({id: 'self', label: 'Self (3 people)'});
  const [insureValue, set_insureValue] = useState({id: 500000, label: '3 Lac to 5 Lakhs'},);
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }
  function conditionalSchema(message) {
    return (dependencyVal, fieldSchema) => {
      return dependencyVal ? fieldSchema.required(message) : fieldSchema;
    };
  }

  /* Form */
  function getFormData() {
    return {
      insureValue: 0,
      insureFor: "self",
    };
  }

  const formSchema = Yup.object().shape({
    insureFor: Yup.string()
      .max(10, 'Maximum ${max} characters allowed')
      .when('insureValue', conditionalSchema('For whom is required')),
    insureValue: Yup.string().matches(/^\d+$/, 'Enter a valid insurance value.'),
  });

  useEffect(() => {
    resetStates();
    //loadDetails();
  }, []);


  const bookInsureSubmit = async (data) => {
    var payload = {
        "userId": user._id,
        "userType": lookingFor.id,
        "insuranceAmnt":  insureValue.id
    };
    console.log("VALUES ARE ", payload);
    try {
        setIsLoading(true);
        const resp = await contactUsApi.postInsurance(JSON.stringify(payload));
        console.log("INSURANCE RESPONSE", resp);
        if (resp?.ok) {
          set_success(true);
        } else {
          setError(
            resp?.data?.errors?.[0]?.msg || 'Error Post Insurance',
          );
        }
        setIsLoading(false);
    } catch (error) {
        setIsLoading(false);
        console.error('Error in post insurance', error);
        setError(error);
    }
  };

  const openSelectDropdown = (dropdown) => {
    set_isScreenScrollable(false);
    set_currentDropdown(dropdown);
  };

  const closeSelectDropdown = (dropdown) => {
    set_isScreenScrollable(true);
    set_currentDropdown(dropdown);
  };

  const contentWidth = useWindowDimensions().width;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.app_logo}>
        <AutoHeightImage
          width={responsiveWidth(100) * 0.16}
          source={require('../assets/logo.png')}
        />
      </View>
      <View style={styles.content}>
        <LoadingIndicator visible={isLoading} />
        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}
        <Text style={styles.heading}>Health Insurance</Text>
        {/* <ScrollView style={styles.scroll_style}> */}
        <ScreenScrollable style={styles.scroll_style} scrollEnabled={isScreenScrollable} keyboardShouldPersistTaps="handled">
            {
                !success ?
            <AppForm
            initialValues={FormDataObject}
            validationSchema={formSchema}
            onSubmit={bookInsureSubmit}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                <Text style={{fontSize: 17}}>Insuring</Text>
                <AppSelectInput
                    aspect_ratio={0.32}
                    width={200}
                    data={[
                    {id: 'self', label: 'Self (3 people)'},
                    {id: 'family', label: 'Family (5 people)'},
                    ]}
                    isOpen={currentDropdown === 1}
                    openSelect={() => openSelectDropdown(1)}
                    closeSelect={() => closeSelectDropdown(6)}
                    optionLabel={'label'}
                    selectedOption={lookingFor}
                    set_selectedOption={set_lookingFor}
                    place_holder_option="For Whom"
                    dp_max_height={responsiveWidth(100) * 0.5}
                />
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <Text style={{fontSize: 17}}>Value:</Text>
                    <AppSelectInput
                        aspect_ratio={0.32}
                        width={200}
                        data={[
                        {id: 100000, label: 'Upto 1 Lac'},
                        {id: 200000, label: '1 Lac to 2 Lakhs'},
                        {id: 500000, label: '3 Lac to 5 Lakhs'},
                        {id: 1000000, label: '6 Lac to 10 Lakhs'},
                        {id: 1100000, label: 'Above 10 Lakhs'},
                        ]}
                        isOpen={currentDropdown === 2}
                        openSelect={() => openSelectDropdown(2)}
                        closeSelect={() => closeSelectDropdown(6)}
                        optionLabel={'label'}
                        selectedOption={insureValue}
                        set_selectedOption={set_insureValue}
                        place_holder_option="Max Cover"
                        dp_max_height={responsiveWidth(100) * 0.5}
                    />
                    {/* <AppFormInput
                    onValueChange={set_insureValue}
                    name="insureValue"
                    keyboardType="number-pad"
                    placeholder={'Max Cover'}
                    style={styles.input_field}
                    /> */}
                </View>
                <AppButtonPrimary
                    btTitle={'SEND REQUEST'}
                    style={{alignSelf: 'center'}}
                    width={24 * 0.0262 * responsiveWidth(100)}
                    height={responsiveWidth(100) * 0.14}
                    aspect_ratio={1}
                    shadowRadius={0}
                    borderRadius={10}
                    textSize={responsiveFontSize(1.9)}
                    gradientBorderWidth={0}
                    gradientColorArray={['#e5a818', '#e89e0b', '#eb9500']}
                    btPress={() => bookInsureSubmit()}
                />
            </AppForm>
            :
            <View style={styles.content}>
                <View style={styles.icon_wrapper}>
                    <AutoHeightImage
                    width={responsiveWidth(100) * 0.2}
                    source={require('../assets/images/congrats_tick.png')}
                    />
                </View>

                <Text style={styles.heading}>Thank You!</Text>

                <Text style={styles.para}>
                    Your health insurance request for {lookingFor.label} submitted successfully!
                </Text>
            </View>
            }
        </ScreenScrollable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  app_logo: {
    marginBottom: 0,
    alignItems: 'center',
  },
  input_field: {
    fontSize: responsiveFontSize(2.0),
  },
  icon_wrapper: {
    marginBottom: 20,
  },
  avatar_wrapper: {
    marginBottom: 30,
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: IsAndroid ? 50 : 80,
    marginBottom: 0,
  },
  para: {
    ...GetTextStyle(undefined, 2.2, undefined, 'center'),
    marginBottom: 5,
  },
  heading: {
    ...GetTextStyle(undefined, 2.6, 'bold'),
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll_style: {
    width: responsiveWidth(100),
    paddingHorizontal: (responsiveWidth(100) - WIDTH) / 2,
  },
});
