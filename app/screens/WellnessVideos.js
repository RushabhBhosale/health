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
import AppButtonPrimary from '../components/AppButtonPrimary';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppSearchSelect from '../components/AppSearchSelect';
import AppSelectInput from '../components/AppSelectInput';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppPanelBasicPlus from '../components/AppPanelBasicPlus';
import {DividerX} from '../components/AppCommonComponents';
import AppErrorMessage from '../components/AppErrorMessage';
import simpleAlert, {ToComePopup} from '../utility/alert-boxes';
import AppBoxShadow from '../components/AppBoxShadow';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import {
  dd_Mon_yyyy,
  Day_dd_Mon_YYYY,
  makeFullName,
  getFullUrl,
} from '../config/functions';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import videosAPI from '../api/videos';
import YoutubePlayer from "react-native-youtube-iframe";

let DOCTOR_LIST = [];
const WIDTH = Container_Width;
const BOOKMARKED = require('../assets/images/icon_bookmark.png');
const NOT_BOOKMARKED = require('../assets/images/icon_bookmark.png');
const ICON_EXCEL = require('../assets/images/doc_excel.png');
const ICON_WORD = require('../assets/images/doc_word.png');
const ICON_PDF = require('../assets/images/doc_pdf.png');
const ICON_ANY = require('../assets/images/doc_prescription.png');

export default function WellnessVideos({route, navigation}) {
  const {user, setUser} = useContext(AuthContext);
  /* ===== States ===== */
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [ videos, set_videos] = useState([]);
  const [categories, set_categories] = useState([]);
  const [searchData, set_searchData] = useState();
  const [showSearch, set_showSearch] = useState(false);
  const [searchText, set_searchText] = useState('');
  const [selectedSearchItem, set_selectedSearchItem] = useState(null);
  const [searchResult, set_searchResult] = useState([]);
  const [pageNo, set_pageNo] = useState(1);
  const [currentDropdown, set_currentDropdown] = useState(1);
  const [category_id, set_categoryId] = useState("All");
  const [video_category, set_videoCategory] = useState("All");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /* ===== Side Effects ===== */
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    const unsubscribe = navigation.addListener('focus', async () => {
        set_videos(await fetchVideosData());
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

  function getYoutubeId(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }

  const updateCategory = async (category) => {
    let videosList = [];
    setIsLoading(true);
    //set_categoryId(category._id);
    set_videoCategory(category.name);
    const resp = await videosAPI.getAllVideos(category._id, 1);
    if (resp?.ok) {
      console.log(resp?.data?.data.length, resp?.data);
      if (resp?.data?.data.length) {
        videosList = resp.data.data.map((item) => { return ((item.youtubeId = getYoutubeId(item.video_url)), item); });
      }
      set_videos(videosList);
    } else {
      console.log(resp);
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching videos',
      );
    }
    setIsLoading(false);
  };

  const fetchVideosData = async () => {
    console.log("fetching videos....");
    let videosList = [];
    setIsLoading(true);
    await fetchVideoCategories();
    const resp = await videosAPI.getAllVideos("All", 1);
    if (resp?.ok) {
      console.log(resp?.data?.data.length, resp?.data);
      if (resp?.data?.data.length) {
        console.log('m in');
        // resp.data.data.forEach((vdo) => {
        //     vdo.youtubeId = getYoutubeId(item.video_url);
        //     videosList.push(vdo)
        // });
        videosList = resp.data.data.map((item) => { return ((item.youtubeId = getYoutubeId(item.video_url)), item); });
      }
      console.log(videosList);
    } else {
      console.log(resp);
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching videos',
      );
    }
    setIsLoading(false);
    return videosList;
  };

  const fetchVideoCategories = async () => {
    console.log("fetching video categories....");
    setIsLoading(true);
    var categs = [{name: "All Categories", _id: "All"}];
    const resp = await videosAPI.getCategories();
    if (resp?.ok) {
      setIsLoading(false);
      if (resp?.data?.length) {
        set_categories(categs.concat(resp.data));
      }
      console.log(categories);
    } else {

    setIsLoading(false);
      console.log(resp);
      setError(
        resp?.data?.errors?.[0]?.msg || 'Error in fetching video categories',
      );
    }
  };

  function dateSort(arrIn) {
    return arrIn.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /* ===== Search ===== */
  useEffect(() => {
    updateCategory(category_id);
    filterSearchResult();
  }, [category_id]);

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
      set_searchData(videos);
    openSearchDropdown();
  };

  const searchInputChanged = (text) => {
    let regExp = null;
    set_searchText(text);
    if (text) {
      regExp = new RegExp(text, 'i');
      set_searchData(
        [...videos].filter((item) => regExp.test(item.title)),
      );
    } else {
      set_searchData(videos);
    }
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

  const onSearchSubmit = () => {
    closeSearchDropdown();
    if (!searchText) set_selectedSearchItem(null);
  };

  const searchItemSelected = (item) => {
    closeSearchDropdown();
    set_selectedSearchItem({...item});
  };

  function filterSearchResult() {
    const docs = videos || [];
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
              Health Wellness
            </AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}>
              Health Education Videos
            </AppPara>
          </View>

          {/* {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )} */}

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

{/*         
          <View style={styles.mid_section}>
            <AppPara
              style={{fontSize: responsiveFontSize(1.85), marginRight: 10}}>
              Search Results ({searchResult.length})
            </AppPara>
          </View> */}

         {/* <View style={{marginBottom: 10}}>
          <FlatList
                data={categories}
                renderItem={({item, index, separators}) => (
                    (item._id === category_id._id) ? <AppButtonPrimary
                    btTitle={item.name}
                    style={{alignSelf: 'flex-end'}}
                    width={responsiveWidth(100) * 0.37}
                    aspect_ratio={0.23}
                    shadowRadius={2}
                    borderRadius={5}
                    textSize={responsiveFontSize(1.6)}
                    gradientBorderWidth={2}
                    gradientColorArray={['#e5a818', '#e89e0b', '#eb9500']}
                    btPress={() => {}}
                  /> : <AppButtonPrimary
                  btTitle={item.name}
                  style={{alignSelf: 'flex-start'}}
                  width={responsiveWidth(100) * 0.37}
                  aspect_ratio={0.23}
                  shadowRadius={2}
                  borderRadius={5}
                  textSize={responsiveFontSize(1.6)}
                  gradientBorderWidth={2}
                  btPress={() => {
                    updateCategory(item);
                    //set_videoCategory(item._id);
                }}
                />
                  )}
                horizontal
              />
          </View> */}
          <View style={{marginBottom: 20}}>
            <AppSelectInput
                aspect_ratio={0.21}
                data={categories}
                isOpen={currentDropdown === 0}
                openSelect={() => openSelectDropdown(0)}
                closeSelect={() => closeSelectDropdown(1)}
                optionLabel={'name'}
                selectedOption={category_id}
                set_selectedOption={set_categoryId}
                place_holder_option="Video Categories"
                dp_max_height={responsiveWidth(100) * 0.5}
              />
          </View>
          <View style={styles.result_section}>
            {
            (videos.length > 0) ?
            <FlatList
              data={searchText !== "" ? videos.filter((item) => { var regExp = new RegExp(searchText, 'i'); return (regExp.test(item.title) || regExp.test(item.description)) }) : videos}
              renderItem={ResultItem(
                user,
                videos.length,
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
            : 
            <AppPara
              style={{fontSize: responsiveFontSize(1.85), paddingTop: 20, textAlign: "center"}}>
              No videos found {video_category !== "" && video_category !== "All" ? "for "+video_category : ""}!
            </AppPara>
            }
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
        <View style={styles.container}>
            <YoutubePlayer height={190} play={false} videoId={item.youtubeId} />
            <Text style={{fontSize: 17, fontWeight: '600'}}>{item.title}</Text>
            <Text style={{fontSize: 13, color: "#666"}}>{item.description}</Text>
        </View>
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
