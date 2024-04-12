import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, LogBox} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import * as Yup from 'yup';
import ScreenScrollable from '../components/ScreenScrollable';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppSelectInput from '../components/AppSelectInput';
import ImagePickerControlPlus from '../components/ImagePickerControlPlus';
import DocumentPickerControl from '../components/DocumentPickerControl';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppFormButton from '../components/AppFormButton';
import AppButtonIcon from '../components/AppButtonIcon';
import LoadingIndicator from '../components/LoadingIndicator';
import AppErrorMessage from '../components/AppErrorMessage';
import AppStyles, {
  Container_Width,
  IsAndroid,
  GetTextStyle,
} from '../config/style';
import AuthContext from '../auth/context';
import uploadsApi from '../api/uploads';
import documentApi from '../api/documents';

const WIDTH = Container_Width;
const DOC_TYPES = [
  {_id: 1, _title: 'Prescription'},
  {_id: 2, _title: 'Lab Report'},
  {_id: 3, _title: 'Invoice'},
];

export default function DocumentUploadScreen({navigation, route}) {
  const {user, setUser} = useContext(AuthContext);
  /* States */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [currentDropdown, set_currentDropdown] = useState(0);
  const [DocumentTypes, set_DocumentTypes] = useState(DOC_TYPES);
  const [selectedDocType, set_selectedDocType] = useState(null);
  const [pickedDocument, set_pickedDocument] = useState(null);
  const [docImage, set_docImage] = useState({uri: ''});
  const [docName, set_docName] = useState({name: ''});
  const [documentError, set_documentError] = useState('');
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* Effects */
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.DOCTYPE_ID) {
        let docIndex = DocumentTypes.findIndex(
          (item) => item._id === route.params.DOCTYPE_ID,
        );
        set_selectedDocType(DocumentTypes[docIndex]);
      }
    });
    return unsubscribe;
  }, [route, route.params]);

  useEffect(() => {
    if (pickedDocument?.uri) {
      set_documentError('');
      if (pickedDocument?.type?.match(/^image/i)) {
        set_docImage(pickedDocument);
        set_docName({name: ''});
      } else {
        set_docImage({uri: ''});
        set_docName({name: pickedDocument.uri});
      }
    }
  }, [pickedDocument]);

  const documentRemoved = () => {
    set_pickedDocument(null);
    set_docImage({uri: ''});
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

  /* Upload Document Form */
  let FormDataObject = getFormData();

  function getFormData() {
    return {
      documentName: '',
    };
  }

  /* Form Validation Schema */
  const documentUploadSchema = Yup.object().shape({
    documentName: Yup.string().required('Document Name is required'),
  });

  /* Save Form Data */
  const saveFormData = async (data) => {
    setIsLoading(true);
    setFormSubmitted(true);
    try {
      let postPayload = data;
      postPayload.userId = user._id;
      postPayload.documentType = selectedDocType._title;
      let uploadedFileProps = await saveDocumentFile();
      if (uploadedFileProps?.fileName) {
        postPayload = Object.assign({}, postPayload, uploadedFileProps);
        const resp = await documentApi.postDocument(user._id, postPayload);
        if (resp?.ok) {
          navigation.navigate('Profile');
        } else {
          setError(resp?.data?.errors?.[0]?.msg || 'Document Saving Error');
        }
      } else {
        console.error('File error');
      }
    } catch (error) {
      console.error('Document Saving Failed', error);
      setError('Error in Document Upload');
    }
    setIsLoading(false);
    setFormSubmitted(false);
  };

  const saveDocumentFile = async () => {
    let uploadResp = {};
    if (pickedDocument) {
      if (pickedDocument.uri) {
        const form_data = new FormData();
        form_data.append('document_file', {
          name:
            pickedDocument.name ||
            pickedDocument.fileName ||
            generateFileName(pickedDocument.type),
          type: pickedDocument.type,
          uri: IsAndroid
            ? pickedDocument.uri
            : pickedDocument.uri.replace('file://', ''),
        });
        try {
          const resp = await uploadsApi.uploadFiles(form_data);
          if (resp?.ok) {
            if (resp?.data?.length)
              uploadResp = {...resp.data[0], docFile_move: resp.data};
          } else {
            setError(resp?.data?.errors?.[0]?.msg || 'Document upload error');
          }
        } catch (error) {
          console.error('Document upload catch', error);
          setError(error.message);
        }
      }
    } else {
      set_documentError('Please select a document');
    }
    return uploadResp;
  };

  function generateFileName(fileType) {
    let fileTypeArr = fileType.split('/');
    let fileExtension = fileTypeArr[fileTypeArr.length - 1];
    return 'unnamed.' + fileExtension;
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
            <AppHeading>Upload Document</AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}></AppPara>
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <AppForm
            initialValues={FormDataObject}
            validationSchema={documentUploadSchema}
            onSubmit={saveFormData}>
            <View style={{marginBottom: 25}}>
              <AppSelectInput
                data={DocumentTypes}
                isOpen={currentDropdown === 1}
                openSelect={() => openSelectDropdown(1)}
                closeSelect={() => closeSelectDropdown(0)}
                selectedOption={selectedDocType}
                optionLabel={'_title'}
                set_selectedOption={set_selectedDocType}
                place_holder_option="Select Document Type"
              />
            </View>

            <View style={{marginBottom: 30}}>
              <AppFormInput
                name="documentName"
                keyboardType="default"
                placeholder={`Name of the ${selectedDocType?._title}`}
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
                  docPicked={set_pickedDocument}
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
                  imagePicked={set_pickedDocument}
                  pickMethod={'CAMERA'}
                  btnType={'primary'}
                  btnTitle={'SCAN FROM CAMERA'}
                  style={{alignSelf: 'flex-start'}}
                />
              </View>
            </View>
            <AppErrorMessage showMsg={true} error={documentError} />

            {docImage?.uri ? (
              <View style={{alignSelf: 'center', marginBottom: 30}}>
                <AutoHeightImage
                  source={{uri: docImage.uri}}
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
            ) : docName?.name ? (
              <Text style={{...GetTextStyle(undefined, 2), marginBottom: 30}}>
                {docName.name}
              </Text>
            ) : null}

            <AppFormButton
              btTitle={'SAVE'}
              style={{marginBottom: 24}}
              width={responsiveWidth(100) * 0.57}
              aspect_ratio={0.23}
              shadowRadius={2}
              textSize={responsiveFontSize(2.45)}
            />

            <AppButtonSecondary
              btTitle={'CLOSE'}
              width={responsiveWidth(100) * 0.3}
              aspect_ratio={0.22}
              shadowRadius={2}
              borderRadius={4}
              fontSize={responsiveFontSize(1.5)}
              btPress={() => navigation.goBack()}
              style={{marginBottom: 20}}
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
    paddingTop: 32,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
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
