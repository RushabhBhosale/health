import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import * as Yup from 'yup';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppInputAppend from '../components/AppInputAppend';
import ImagePickerControlPlus from '../components/ImagePickerControlPlus';
import DocumentPickerControl from '../components/DocumentPickerControl';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppFormButton from '../components/AppFormButton';
import AppButtonIcon from '../components/AppButtonIcon';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import simpleAlert from '../utility/alert-boxes';
import AppStyles, {
  Container_Width,
  IsAndroid,
  GetTextStyle,
} from '../config/style';
import {dd_Mon_yyyy} from '../config/functions';
import AuthContext from '../auth/context';
import uploadsApi from '../api/uploads';
import medInsuranceApi from '../api/medicalInsurance';
import settings from '../config/settings';

const config = settings();
const BASE_URL = config.cdnUrl;
const WIDTH = Container_Width;

export default function AddMedInsuranceScreen({route, navigation}) {
  const {user, setUser} = useContext(AuthContext);
  /* States */
  const [medInsurance, set_medInsurance] = useState({});
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [isDatePicker, set_isDatePicker] = useState(false);
  const [expiryDate, set_expiryDate] = useState();
  const [expDateError, set_expDateError] = useState('');
  const [docSelected, set_docSelected] = useState(false);
  const [pickedDocument, set_pickedDocument] = useState(null);
  const [isDocAnImage, set_isDocAnImage] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* Effects */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.InsuranceId)
        fetchMedInsurance(route.params.InsuranceId);
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (medInsurance._id) {
      populateForm();
    }
  }, [medInsurance]);

  useEffect(() => {
    if (pickedDocument?.type?.match)
      pickedDocument.type.match(/^image/i)
        ? set_isDocAnImage(true)
        : set_isDocAnImage(false);
  }, [pickedDocument]);

  /* Async api calls */
  const fetchMedInsurance = async (_id) => {
    setIsLoading(true);
    const resp = await medInsuranceApi.getMedicalInsurance(_id);
    if (resp?.ok) {
      if (resp?.data?._id) set_medInsurance(resp.data);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching Medical Insurance',
      );
    }
    setIsLoading(false);
  };

  /* Date Picker */
  const showDatePicker = () => {
    set_isDatePicker(true);
  };

  const hideDatePicker = () => {
    set_isDatePicker(false);
  };

  const handleDateConfirm = (date) => {
    set_expiryDate(date);
    hideDatePicker();
  };

  /* Document Picker */
  const documentPickedUP = (document) => {
    set_docSelected(true);
    set_pickedDocument(document);
  };

  const documentRemoved = () => {
    set_docSelected(true);
    set_pickedDocument(null);
  };

  function getFormData() {
    return {
      insuranceProvider: '',
      policyNumber: '',
      policyAmount: '',
    };
  }

  function populateForm() {
    copyObjectByKeys(medInsurance, FormDataObject);
    if (medInsurance?.expiryDate)
      set_expiryDate(new Date(medInsurance?.expiryDate));
    if (medInsurance?.policyDocument)
      set_pickedDocument(medInsurance.policyDocument);
  }

  function copyObjectByKeys(srcObj, destObj) {
    Object.keys(destObj).forEach(
      (key) => (destObj[key] = srcObj[key] ? srcObj[key] : destObj[key]),
    );
  }

  /* Form Validation Schema */
  const formSchema = Yup.object().shape({
    insuranceProvider: Yup.string()
      .required('Insurance Provider is required')
      .max(200, 'Maximum ${max} characters allowed'),
    policyNumber: Yup.number()
      .required('Policy Number is required')
      .typeError('Only numeric value allowed')
      .integer('Only integer value allowed')
      .positive('Please enter positive value'),
    policyAmount: Yup.number()
      .required('Policy Amount is required')
      .typeError('Only numeric value allowed')
      .integer('Only integer value allowed')
      .positive('Please enter positive value')
      .lessThan(1000000000, 'Should be less than ${less}'),
  });

  /* Reset Form */
  const resetForm = () => {
    set_medInsurance({});
    set_FormDataObject(getFormData());
    set_expiryDate();
    set_expDateError('');
    set_docSelected(false);
    set_pickedDocument(null);
    setFormSubmitted(false);
    setError('');
  };

  /* Save Form Data */
  const saveFormData = async (data) => {
    setIsLoading(true);
    setFormSubmitted(true);
    try {
      let postPayload = data;
      postPayload.userId = user._id;
      formatPayload(postPayload);
      postPayload.expiryDate = appendExpiryDate();
      postPayload = {...postPayload, ...(await appendDocument())};
      if (postPayload.expiryDate && postPayload.policyDocument) {
        const resp = medInsurance._id
          ? await medInsuranceApi.updateMedicalInsurance(
              postPayload,
              medInsurance._id,
            )
          : await medInsuranceApi.addMedicalInsurance(postPayload);
        if (resp?.ok) {
          if (resp?.data) navigation.goBack();
        } else
          setError(resp?.data?.errors?.[0]?.msg || 'Medical Insurance error');
      }
    } catch (error) {
      console.log('Medical Insurance Failed', error);
      setError('Server Error in Medical Insurance');
    }
    setIsLoading(false);
    setFormSubmitted(false);
  };

  const formatPayload = (inputObj) => {
    inputObj.policyNumber = Number(inputObj.policyNumber);
    inputObj.policyAmount = Number(inputObj.policyAmount);
  };

  const appendExpiryDate = () => {
    let expDate = false;
    expDate = expiryDate ? expiryDate : medInsurance.expiryDate;
    if (!expDate) set_expDateError('Please select a policy expiry date');
    return expDate;
  };

  const appendDocument = async () => {
    setIsLoading(true);
    let document = {policyDocument: false, policyDocument_move: false};
    if (docSelected) {
      if (pickedDocument?.uri) {
        try {
          const form_data = new FormData();
          form_data.append('medical_insurance', {
            name:
              pickedDocument.name ||
              pickedDocument.fileName ||
              generateFileName(pickedDocument.type),
            type: pickedDocument.type,
            uri: IsAndroid
              ? pickedDocument.uri
              : pickedDocument.uri.replace('file://', ''),
          });
          const resp = await uploadsApi.uploadFiles(form_data);
          if (resp?.ok) {
            if (resp?.data?.length)
              document = {
                policyDocument: {
                  uri: resp.data[0]?.fileName,
                  type: resp.data[0]?.fileType,
                  fileExtension: resp.data[0]?.fileExtension,
                  isAnImage: resp.data[0]?.isAnImage,
                },
                policyDocument_move: resp.data,
              };
          } else
            setError(
              resp?.data?.errors?.[0]?.msg || 'Policy Document upload error',
            );
        } catch (error) {
          console.log('Policy Document upload error', error);
          setError(error.message);
        }
      } else setError('Please attach a policy document');
    } else {
      if (medInsurance.policyDocument)
        document.policyDocument = medInsurance.policyDocument;
      else setError('Please attach a policy document');
    }
    setIsLoading(false);
    return document;
  };

  function generateFileName(fileType) {
    let fileTypeArr = fileType.split('/');
    let fileExtension = fileTypeArr[fileTypeArr.length - 1];
    return 'unnamed.' + fileExtension;
  }

  function openDocumentRemote(userId, document, setIsLoading) {
    setIsLoading(true);
    const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${document.fileExtension}`;

    const options = {
      fromUrl: BASE_URL + 'patients/' + userId + '/' + document.uri,
      toFile: localFile,
    };
    RNFS.downloadFile(options)
      .promise.then(() =>
        FileViewer.open(localFile, {showOpenWithDialog: true}),
      )
      .then(() => {
        console.log('file is viewed successfully...');
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('File view error______ : ', error);
        setIsLoading(false);
      });
  }

  function prepDocUri(docName) {
    return BASE_URL + 'patients/' + user._id + '/' + docName;
  }

  const deleteForm = () => {
    simpleAlert({
      title: 'Delete Medical Insurance!',
      content: 'Confirm, if you want to delete this Medical Insurance policy?',
      okText: 'Confirm',
      okCallback: deleteMedInsurance,
      showCancel: true,
    });
  };

  async function deleteMedInsurance() {
    const resp = await medInsuranceApi.deleteInsurance(medInsurance._id);
    if (resp?.ok) {
      if (resp?.data) navigation.goBack();
    } else
      setError(
        resp?.data?.errors?.[0]?.msg || 'Medical Insurance delete error',
      );
  }

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <ScreenScrollable>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>Add Medical Insurance</AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}>
              For your financial protection incase of a serious illness
            </AppPara>
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
              <AppFormInput
                name="insuranceProvider"
                keyboardType="default"
                placeholder="Insurance Provider"
                style={{fontSize: responsiveFontSize(2.0)}}
              />
            </View>

            <View style={{marginBottom: 20}}>
              <AppFormInput
                name="policyNumber"
                keyboardType="default"
                placeholder="Policy Number"
                style={{fontSize: responsiveFontSize(2.0)}}
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
                placeholder={'Expiry Date'}
                value={expiryDate && dd_Mon_yyyy(expiryDate)}
                editable={false}
                keyboardType="default"
                fontSize={responsiveFontSize(2.0)}
                showMsg={Boolean(expDateError)}
                error={expDateError}
              />
              <DateTimePickerModal
                isVisible={isDatePicker}
                mode="date"
                value={expiryDate}
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            <View style={{marginBottom: 40}}>
              <AppFormInput
                name="policyAmount"
                keyboardType="default"
                placeholder="Policy Amount"
                style={{fontSize: responsiveFontSize(2.0)}}
              />
            </View>

            <View style={styles.btn_group}>
              <View
                style={{
                  flex: 1,
                  paddingRight: 5,
                }}>
                <DocumentPickerControl
                  docPicked={documentPickedUP}
                  btnTitle={'ADD IMAGE'}
                  style={{alignSelf: 'flex-end'}}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  paddingLeft: 5,
                }}>
                <ImagePickerControlPlus
                  imagePicked={documentPickedUP}
                  pickMethod={'CAMERA'}
                  btnType={'primary'}
                  btnTitle={'SCAN FROM CAMERA'}
                  style={{alignSelf: 'flex-start'}}
                />
              </View>
            </View>

            <View>
              {pickedDocument?.uri ? (
                isDocAnImage ? (
                  <View style={{alignSelf: 'center', marginBottom: 30}}>
                    <AutoHeightImage
                      source={{
                        uri: docSelected
                          ? pickedDocument.uri
                          : prepDocUri(pickedDocument.uri),
                      }}
                      width={WIDTH / 2}
                      style={{
                        borderRadius: 10,
                      }}
                    />
                    <AppButtonIcon
                      width={20}
                      style={styles.btn_remove}
                      btPress={documentRemoved}>
                      <Image
                        style={{
                          width: '40%',
                          height: '40%',
                          resizeMode: 'contain',
                        }}
                        source={require('../assets/images/close_icon.png')}
                      />
                    </AppButtonIcon>
                  </View>
                ) : (
                  <AppButtonSecondary
                    btTitle={'View Document'}
                    width={responsiveWidth(100) * 0.3}
                    aspect_ratio={0.22}
                    shadowRadius={2}
                    borderRadius={4}
                    fontSize={responsiveFontSize(1.5)}
                    style={{marginBottom: 30}}
                    btPress={async () =>
                      docSelected
                        ? await FileViewer.open(pickedDocument.uri)
                        : openDocumentRemote(
                            user._id,
                            pickedDocument,
                            setIsLoading,
                          )
                    }
                  />
                )
              ) : null}
            </View>

            <AppFormButton
              btTitle={'SAVE'}
              style={{marginBottom: 24}}
              width={responsiveWidth(100) * 0.57}
              aspect_ratio={0.23}
              shadowRadius={2}
              textSize={responsiveFontSize(2.45)}
            />

            <AppButtonSecondary
              btTitle={medInsurance._id ? 'DELETE' : 'RESET'}
              width={responsiveWidth(100) * 0.3}
              aspect_ratio={0.22}
              shadowRadius={2}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              btPress={medInsurance._id ? deleteForm : resetForm}
            />
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
    marginBottom: 10,
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
  btn_group: {
    flexDirection: 'row',
    marginBottom: 45,
  },
  btn_remove: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});
