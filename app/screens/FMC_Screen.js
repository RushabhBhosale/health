import React, {useContext, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Linking,
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
import fmcApi from '../api/fmc';

let DOCTOR_LIST = [];
const WIDTH = Container_Width;
const BOOKMARKED = require('../assets/images/icon_bookmark.png');
const NOT_BOOKMARKED = require('../assets/images/icon_bookmark.png');
const ICON_EXCEL = require('../assets/images/doc_excel.png');
const ICON_WORD = require('../assets/images/doc_word.png');
const ICON_PDF = require('../assets/images/doc_pdf.png');
const ICON_ANY = require('../assets/images/doc_prescription.png');

export default function FMCScreen({route, navigation}) {
  const {user, setUser} = useContext(AuthContext);
  /* ===== States ===== */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [fmcs, set_FMCS] = useState([]);
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
    const unsubscribe = navigation.addListener('focus', async () => {
        set_FMCS(await fetchFMCData());
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // if (route.params?.DOCUMENTS) {
      //   let {DOCUMENTS} = route.params;
      //   set_Documents(DOCUMENTS);
      //   set_searchResult(dateSort(DOCUMENTS.docs));
      // }
      // if (route.params?.DOCTORS) DOCTOR_LIST = route.params.DOCTORS;
      resetStates();
    });
    return unsubscribe;
  }, [route, route.params]);

  /* ===== Functions ===== */
  function resetStates() {
    set_searchText('');
  }

  const fetchFMCData = async () => {
    console.log("fetching fmcs....");
    let fmcList = [];
    setIsLoading(true);
    const resp = await fmcApi.getFMCs();
    if (resp?.ok) {
      if (resp?.data?.length)
        fmcList = resp.data.map(
          (item) => { console.log(item.fmcAddress[0].location.coordinates);
            console.log(item.fmcBankDetails); return ((item.updatedByWho = 'admin'), item) }
        );
        console.log("FMC List", fmcList);
    } else {
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching fmc list',
      );
    }
    setIsLoading(false);
    return fmcList.map((item) => ((item.updatedByWho = 'admin'), item));
  };

  function dateSort(arrIn) {
    return arrIn.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /* ===== Search ===== */
  useEffect(() => {
    if (selectedSearchItem) {
      set_searchText(selectedSearchItem.name);
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
      set_searchData(fmcs);
    openSearchDropdown();
  };

  const searchInputChanged = (text) => {
    let regExp = null;
    set_searchText(text);
    if (text) {
      regExp = new RegExp(text, 'gi');
      //console.log([...fmcs].filter((item) => (regExp.test(item.name) || (item.fmcAddress[0] !== undefined ? regExp.test(item.fmcAddress[0].address) : ""))));
      set_searchData(
        [...fmcs].filter((item) => (regExp.test(item.name) || (item.fmcAddress[0] !== undefined ? regExp.test(item.fmcAddress[0].address) : ""))),
      );
    } else {
      set_searchData(fmcs);
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
    const docs = fmcs || [];
    if (selectedSearchItem) {
      set_searchResult(
        docs
        // docs.filter((item) => {
        //   let searchId =
        //     item.documentType === 'AppointmentPrescription' ||
        //     item.documentType === 'Appointment'
        //       ? item.doctorId
        //       : item.userId
        //       ? item.userId
        //       : 0;
        //   if (searchId === selectedSearchItem._id) return true;
        // }),
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
              FMCs ({fmcs.length})
            </AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}>
              List of all nearby available FMCs
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
              optionLabel={'name'}
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
            {/* <AppButtonSecondary
              btTitle={'UPLOAD'}
              width={responsiveWidth(100) * 0.22}
              aspect_ratio={0.3}
              shadowRadius={2}
              borderRadius={4}
              // btPress={() =>
              //   // navigation.navigate('DocumentUpload', {
              //   //   DOCTYPE_ID: Documents._id,
              //   // })
              // }
            /> */}
          </View>

          <View style={styles.result_section}>
            <FlatList
              data={searchText !== "" ? fmcs.filter((item) => { var regExp = new RegExp(searchText, 'i'); return (regExp.test(item.name) || (item.fmcAddress[0] !== undefined ? regExp.test(item.fmcAddress[0].address) : "")); }) : fmcs}
              renderItem={ResultItem(
                user,
                fmcs.length,
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
    return (
      <View style={!isNotLast && {marginBottom: 40}}>
        <AppPanelBasicPlus
          style={{
            backgroundColor: 'transparent',
            padding: 0,
          }}
          style_row={{justifyContent: 'space-between'}}
          img_section_width={'0%'}
          img_width={0}
          //image={doc_image}
          //image_pressed={() => openDocument(item, setIsLoading)}
          txt_section_width={'80%'}
          txt_section={
            <>
              <TouchableWithoutFeedback>
                  <View>
                    <Text style={GetTextStyle('#333333', 2, 'bold')}>
                      {item.name}
                    </Text>
                    <Text
                      style={[GetTextStyle('#888888', 1.7), {marginBottom: 4}]}>
                      {item.fmcAddress.length > 0
                        ? item.fmcAddress[0].address
                        : ' '}
                    </Text>
                    <Text
                      style={[GetTextStyle('#666', 1.7, "600"), {marginBottom: 7}]}>
                      {"Call: "+item.phone}
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
                {
                  ((item.fmcAddress.length > 0) && (item.fmcAddress[0].location.coordinates.length > 0) && (item.fmcAddress[0].location.coordinates[0] !== null)) ?
                <TouchableOpacity
                  onPress={() => {
                    const url = Platform.select({
                      ios: "maps:" + item.fmcAddress[0].location.coordinates[0] + "," + item.fmcAddress[0].location.coordinates[1] + "?q=" + item.name+" "+item.fmcAddress[0].address+" "+item.fmcAddress[0].city,
                      android: "geo:" + item.fmcAddress[0].location.coordinates[0] + "," + item.fmcAddress[0].location.coordinates[1] + "?q=" + item.name+" "+item.fmcAddress[0].address+" "+item.fmcAddress[0].city
                    });
                    Linking.openURL(url);
                  }}>
                  <AutoHeightImage
                    width={responsiveWidth(100) * 0.08}
                    maxHeight={33}
                    source={require('../assets/images/icon_direction.png')}
                    style={{
                      alignSelf: 'flex-start',
                    }}
                  />
                </TouchableOpacity>
                  : <TouchableOpacity><AutoHeightImage
                  width={responsiveWidth(100) * 0.08}
                  maxHeight={33}
                  source={require('../assets/images/icon_direction.png')}
                  style={{
                    opacity: 0.3,
                    titnColor: "grey",
                    alignSelf: 'flex-start',
                  }}
                /></TouchableOpacity>
                }
            </View>
          }
        />
        {isNotLast && <DividerX style={{marginVertical: 18}} />}
      </View>
    );
};

const resultKeyExtractor = (item, index) => 'result-item-' + index;

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
