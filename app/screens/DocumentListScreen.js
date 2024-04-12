import React, {useContext, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AutoHeightImage from 'react-native-auto-height-image';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppSearchSelect from '../components/AppSearchSelect';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppPanelBasicPlus from '../components/AppPanelBasicPlus';
import {DividerX} from '../components/AppCommonComponents';
import AppErrorMessage from '../components/AppErrorMessage';
import simpleAlert, {ToComePopup} from '../utility/alert-boxes';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {
  dd_Mon_yyyy,
  Day_dd_Mon_YYYY,
  makeFullName,
  getFullUrl,
} from '../config/functions';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import documentApi from '../api/documents';
import { useTranslation } from 'react-i18next';

let DOCTOR_LIST = [];
const WIDTH = Container_Width;
const BOOKMARKED = require('../assets/images/icon_bookmark.png');
const NOT_BOOKMARKED = require('../assets/images/icon_bookmark.png');
const ICON_EXCEL = require('../assets/images/doc_excel.png');
const ICON_WORD = require('../assets/images/doc_word.png');
const ICON_PDF = require('../assets/images/doc_pdf.png');
const ICON_ANY = require('../assets/images/doc_prescription.png');

export default function DocumentListScreen({route, navigation}) {
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  /* ===== States ===== */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [Documents, set_Documents] = useState({});
  const [searchData, set_searchData] = useState();
  const [showSearch, set_showSearch] = useState(false);
  const [searchText, set_searchText] = useState('');
  const [selectedSearchItem, set_selectedSearchItem] = useState(null);
  const [searchResult, set_searchResult] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /* ===== Side Effects ===== */
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.DOCUMENTS) {
        let {DOCUMENTS} = route.params;
        console.log("PRESCRIPTIONS", DOCUMENTS);
        set_Documents(DOCUMENTS);
        console.log("documents list...", DOCUMENTS.docs);
        set_searchResult(dateSort(DOCUMENTS.docs));
      }
      if (route.params?.DOCTORS) DOCTOR_LIST = route.params.DOCTORS;
      resetStates();
    });
    return unsubscribe;
  }, [route, route.params]);

  /* ===== Functions ===== */
  function resetStates() {
    set_searchText('');
  }

  function dateSort(arrIn) {
    return arrIn.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /* ===== Search ===== */
  useEffect(() => {
    if (selectedSearchItem) {
      set_searchText(selectedSearchItem.fullName);
    } else {
      set_searchText('');
    }
    filterSearchResult();
  }, [selectedSearchItem]);

  function openSearchDropdown() {
    set_showSearch(false);
    set_isScreenScrollable(false);
  }

  function closeSearchDropdown() {
    set_showSearch(false);
    set_isScreenScrollable(true);
  }

  const searchInputFocused = (event) => {
    if (!event._dispatchInstances.memoizedProps.text)
      set_searchData(DOCTOR_LIST);
    openSearchDropdown();
  };

  const searchInputChanged = (text) => {
    let regExp = null;
    set_searchText(text);
    if (text) {
      regExp = new RegExp(text, 'i');
      console.log("DOCUMENTS LIST", searchResult);
      set_searchData(
        [...DOCTOR_LIST].filter((item) => regExp.test(item.fullName)),
        //[...DOCTOR_LIST].filter((item) => ((item.patient !== undefined ? regExp.test(item.patient?.firstName) : "") || (item.patient !== undefined ? regExp.test(item.patient?.lastName) : "") || (item.firstName !== undefined ? regExp.test(item.firstName) : "") || (item.lastName !== undefined ? regExp.test(item.lastName) : "") || (item.doctorData !== undefined ? regExp.test(item.doctorData?.firstName) : "") || (item.doctorData !== undefined ? regExp.test(item.doctorData?.lastName) : ""))),
      );
    } else {
      set_searchData(DOCTOR_LIST);
    }
  };

  const onSearchSubmit = () => {
    closeSearchDropdown();
    if (!searchText) set_selectedSearchItem(null);
  };

  const searchItemSelected = (item) => {
    closeSearchDropdown();
    set_selectedSearchItem({...item});
  };

  function filterSearchResult() {
    const docs = Documents?.docs || [];
    if (selectedSearchItem) {
      set_searchResult(
        docs.filter((item) => {
          let searchId =
            item.documentType === 'AppointmentPrescription' ||
            item.documentType === 'Appointment'
              ? item.doctorId
              : item.userId
              ? item.userId
              : 0;
          if (searchId === selectedSearchItem._id) return true;
        }),
      );
    } else {
      set_searchResult(docs);
    }
  }

  return (
    <>
      <LoadingIndicator visible={isLoading} />
      <View
        style={styles.mainContainer}
        onStartShouldSetResponderCapture={(event) => closeSearchDropdown()}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>
              {Documents?.title} ({searchResult.length})
            </AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}>
              {t("prescr_descr")}
            </AppPara>
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <View style={styles.search_section}>
            <AppSearchSelect
              data={searchData}
              isOpen={showSearch}
              openSelect={openSearchDropdown}
              searchText={searchText}
              optionLabel={'fullName'}
              inputFocused={searchInputFocused}
              inputChanged={searchInputChanged}
              searchButtonPressed={onSearchSubmit}
              onSubmitEditing={onSearchSubmit}
              itemSelected={searchItemSelected}
              place_holder="Quick Search"
              input_fontSize={responsiveFontSize(2.2)}
            />
          </View>

          <View style={styles.mid_section}>
            <AppPara
              style={{fontSize: responsiveFontSize(1.85), marginRight: 10}}>
              Search Results ({searchResult.length})
            </AppPara>
            <AppButtonSecondary
              btTitle={'UPLOAD'}
              width={responsiveWidth(100) * 0.22}
              aspect_ratio={0.3}
              shadowRadius={2}
              borderRadius={4}
              btPress={() =>
                navigation.navigate('DocumentUpload', {
                  DOCTYPE_ID: Documents._id,
                })
              }
            />
          </View>

          <View style={styles.result_section}>
            <FlatList
              data={searchText !== "" ? searchResult.filter((item) => { var regExp = new RegExp(searchText, 'i'); return ((item.appointmentInfo !== undefined ? regExp.test(item.appointmentInfo.consultTypeName) : "") || (item.documentName !== undefined ? regExp.test(item.documentName) : "") || (item.firstName !== undefined ? regExp.test(item.firstName) : "") || (item.lastName !== undefined ? regExp.test(item.lastName) : "") || (item.appointmentInfo !== undefined ? regExp.test(item.appointmentInfo.doctorData?.firstName) : "") || (item.appointmentInfo !== undefined ? regExp.test(item.appointmentInfo.doctorData?.lastName) : "")); }) : searchResult}
              //data={searchResult}
              renderItem={ResultItem(
                user,
                searchResult.length,
                navigation,
                setIsLoading,
                setError,
              )}
              keyExtractor={resultKeyExtractor}
              contentContainerStyle={{
                width: WIDTH,
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const ResultItem = (user, totalItems, navigation, setIsLoading, setError) => ({
  item,
  index,
}) => {
  const isNotLast = index < totalItems - 1;
  if (
    item.documentType === 'AppointmentPrescription' ||
    item.documentType === 'Appointment'
  ) {
    let apnt = {},
      prescriptionPressed = () => void 0,
      doc_title = '';
    if (item.documentType === 'Appointment') {
      apnt = item;
      prescriptionPressed = () =>
        navigation.navigate('InvoiceDetail', {
          APPOINTMENT: item,
        });
      doc_title = 'Appointment Invoice';
    } else {
      apnt = item?.appointmentInfo;
      prescriptionPressed = () =>
        navigation.navigate('PrescriptionDetail', {
          PrescriptionId: item._id,
        });
      doc_title = makeFullName(
        apnt?.doctorData?.firstName,
        apnt?.doctorData?.lastName,
        'Dr.',
      );
    }
    const doc_image = ICON_ANY;
    const consult_name = apnt?.consultTypeName === 'Video' ? 'Video' : 'Clinic';
    const consult_happen = apnt?.is_firstVisit ? 'First Time' : 'Follow Up';

    return (
      <View style={!isNotLast && {marginBottom: 40}}>
        <AppPanelBasicPlus
          style={{
            backgroundColor: 'transparent',
            padding: 0,
          }}
          style_row={{justifyContent: 'space-between'}}
          img_section_width={'20%'}
          img_width={responsiveWidth(100) * 0.15}
          image={doc_image}
          image_pressed={prescriptionPressed}
          txt_section_width={'80%'}
          txt_section={
            <>
              <TouchableWithoutFeedback onPress={prescriptionPressed}>
                <View>
                  <Text style={GetTextStyle('#333333', 2, 'bold')}>
                    {doc_title}
                  </Text>
                  <Text style={GetTextStyle(undefined, 1.7)}>
                    {consult_name +
                      ' Consultation, ' +
                      consult_happen +
                      ',\n' + (apnt !== null && apnt.patient !== null && apnt.patient !== undefined ? 'Patient:' + (apnt.patient.firstName !== undefined ? (apnt.patient.firstName + ' ' + apnt.patient.lastName) : (apnt.userData !== undefined ? apnt.userData.firstName + " " + apnt.userData.lastName : '')) : "") + '\n' +
                      Day_dd_Mon_YYYY(apnt !== null ? new Date(apnt.appointmentDate) : null) +
                      ', ' +
                      (apnt !== null ? apnt.appointmentTime : "na")}
                  </Text>
                  <Text style={GetTextStyle(undefined, 1.7)}>
                    
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </>
          }
        />
        {isNotLast && <DividerX style={{marginVertical: 18}} />}
      </View>
    );
  } else {
    const doc_image = item.fileExtension.match(/(xls|xlsx)/i)
      ? ICON_EXCEL
      : item.fileExtension.match(/(doc|docx)/i)
      ? ICON_WORD
      : item.fileExtension.match(/pdf/i)
      ? ICON_PDF
      : ICON_ANY;
    return (
      <View style={!isNotLast && {marginBottom: 40}}>
        <AppPanelBasicPlus
          style={{
            backgroundColor: 'transparent',
            padding: 0,
          }}
          style_row={{justifyContent: 'space-between'}}
          img_section_width={'20%'}
          img_width={responsiveWidth(100) * 0.15}
          image={doc_image}
          image_pressed={() => openDocument(item, setIsLoading)}
          txt_section_width={'75%'}
          txt_section={
            <>
              <TouchableWithoutFeedback
                onPress={() => openDocument(item, setIsLoading)}>
                <View>
                  <Text style={GetTextStyle('#333333', 2, 'bold')}>
                    {item.documentName}
                  </Text>
                  <Text
                    style={[GetTextStyle('#888888', 1.7), {marginBottom: 7}]}>
                    By{' '}
                    {item.uploadedBy === 'doctor'
                      ? makeFullName(
                          item.doctorData?.firstName,
                          item.doctorData?.lastName,
                          'Dr.',
                        )
                      : makeFullName(user.firstName, user.lastName)}
                    {', '}
                    {dd_Mon_yyyy(new Date(item.updatedAt))}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </>
          }
          aside_element={
            <View
              style={{
                justifyContent: 'space-between',
                alignSelf: 'stretch',
              }}>
              <TouchableOpacity onPress={ToComePopup}>
                <AutoHeightImage
                  width={responsiveWidth(100) * 0.04}
                  source={true ? BOOKMARKED : NOT_BOOKMARKED}
                  style={{
                    alignSelf: 'flex-start',
                  }}
                />
              </TouchableOpacity>
              {item.uploadedBy === 'patient' ? (
                <TouchableOpacity
                  onPress={() => deleteDocument(item, navigation, setError)}>
                  <AutoHeightImage
                    width={responsiveWidth(100) * 0.04}
                    source={require('../assets/images/close_icon_red.png')}
                    style={{
                      alignSelf: 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
        {isNotLast && <DividerX style={{marginVertical: 18}} />}
      </View>
    );
  }
};

const resultKeyExtractor = (item, index) => 'result-item-' + index;

function openDocument(document, setIsLoading) {
  setIsLoading(true);
  const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${document.fileExtension}`;
  const docDir = document.uploadedBy === 'patient' ? 'patients/' : 'doctors/';
  const options = {
    fromUrl: getFullUrl(document.fileName, docDir + document.userId + '/'),
    toFile: localFile,
  };
  RNFS.downloadFile(options)
    .promise.then(() => FileViewer.open(localFile, {showOpenWithDialog: true}))
    .then(() => {
      console.log('file is viewed successfully...');
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('File view error______ : ', error);
      setIsLoading(false);
    });
}

function deleteDocument(document, navigation, setError) {
  simpleAlert({
    title: 'Delete Document!',
    content: `Do you want to delete : ${document.documentName}?`,
    okText: 'Confirm',
    okCallback: () => deleteConfirm(document._id, navigation, setError),
    showCancel: true,
  });
}

async function deleteConfirm(documentId, navigation, setError) {
  const resp = await documentApi.deleteDocument(documentId);
  if (resp?.ok) {
    if (resp?.data) navigation.goBack();
  } else setError(resp?.data?.errors?.[0]?.msg || 'Document delete error');
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 32,
    paddingBottom: 0,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    flexShrink: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sub_header: {
    flexShrink: 1,
    alignSelf: 'center',
    width: '86%',
    marginBottom: 15,
  },
  sub_title: {
    fontSize: responsiveFontSize(2.0),
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  search_section: {
    flexShrink: 1,
    marginBottom: 20,
  },
  searchInput: {
    width: WIDTH,
  },
  search_result: {
    backgroundColor: 'white',
    maxHeight: responsiveWidth(100) * 0.94,
    borderRadius: 15,
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    top: WIDTH * 0.26,
  },
  search_result_list: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  search_result_item: {
    paddingVertical: 5,
  },
  search_result_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2),
  },
  mid_section: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  result_section: {
    flex: 1,
    marginBottom: 0,
    width: responsiveWidth(100),
    alignSelf: 'center',
  },
});
