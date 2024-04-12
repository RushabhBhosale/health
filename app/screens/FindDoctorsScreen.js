import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SectionList,
  TouchableOpacity,
  Keyboard,
  ScrollView,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Yup from 'yup';
import AutoHeightImage from 'react-native-auto-height-image';
import AppModalBottomUp from '../components/AppModalBottomUp';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenScrollable from '../components/ScreenScrollable';
import AppButtonIconInner from '../components/AppButtonIconInner';
import AppButtonIcon from '../components/AppButtonIcon';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppInputAppend from '../components/AppInputAppend';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppForm from '../components/AppForm';
import AppFormInput from '../components/AppFormInput';
import AppFormButton from '../components/AppFormButton';
import AppCardDoctor from '../components/AppCardDoctor';
import AppRadioInputPlus from '../components/AppRadioInputPlus';
import {DividerX} from '../components/AppCommonComponents';
import AppErrorMessage from '../components/AppErrorMessage';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthContext from '../auth/context';
import doctorsApi from '../api/doctors';
import specialistsApi from '../api/specialists';
import searchApi from '../api/search';
import {FILTERS} from './DoctorsData';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18next';

const IMG_CLOSE = require('../assets/images/close_icon_trans.png');
const IMG_SEARCH = require('../assets/images/icon_search_grey.png');
const IMG_SEARCH_TRANS = require('../assets/images/icon_search_transparent.png');

const WIDTH = Container_Width;
let SPECIALITY_DOCT_COUNT = [];
let ALL_SPECIALITIES = [];
let RECENT_POPULAR_SEARCHES = [];
let UserPincode = 0;

export default function FindDoctorsScreen({route, navigation}) {
  const {t, i18n} = useTranslation();
  const {user, setUser} = useContext(AuthContext);
  const isSpecialityPristine = useRef(true);

  const [DoctorsList, set_DoctorsList] = useState([]);
  const [Doctors, set_Doctors] = useState([]);

  const [Specialities, set_Specialities] = useState([]);
  const [activeSpeciality, set_activeSpeciality] = useState(null);

  const [searchData, set_searchData] = useState();
  const [isScreenScrollable, set_isScreenScrollable] = useState(true);
  const [scrollViewOffsetY, set_scrollViewOffsetY] = useState(0);
  const [showSearch, set_showSearch] = useState(false);
  const [searchText, set_searchText] = useState('');

  const ref_bottomPopup = useRef();
  const [filterData, set_filterData] = useState(FILTERS);
  const [FormDataObject, set_FormDataObject] = useState(getFormData());
  const [filters, set_filters] = useState(resetFilters());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  UserPincode = user?.pincode;

  let selected_filter_consult_type = filterData.consult_type.find(
    (item) => item.id === filters.consult_type,
  );
  let selected_filter_availability = filterData.availability.find(
    (item) => item.id === filters.availability,
  );
  let selected_filter_gender = filterData.gender.find(
    (item) => item.id === filters.gender,
  );
  let selected_filter_consult_fees = filterData.consult_fees.find(
    (item) => item.id === filters.consult_fees,
  );
  let selected_filter_distance = filterData.distance.find(
    (item) => item.id === filters.distance,
  );

  const Image_Search = showSearch ? IMG_SEARCH_TRANS : IMG_SEARCH;
  const BgColor_Search = showSearch ? '#8BC641' : 'transparent';

  function resetStates() {
    setError('');
  }

  function resetFilters() {
    return {
      pincode: user?.pincode,
      consult_type: 0,
      availability: 0,
      gender: 0,
      consult_fees: 0,
      distance: 2,
    };
  }

  /* ===== Side Effects ===== */
  let unsubscribe = null;
  useEffect(() => {
    unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      if (route?.params?.fromSpecialist) {
        if (route?.params?.specialistsArray)
          set_Specialities(route.params.specialistsArray);
        if (route?.params?.FILTERS) {
          set_filters(route.params.FILTERS);
          populateForm(route.params.FILTERS.pincode);
        }
      } else {
        setIsLoading(true);
        set_filters(resetFilters());
        loadSpecialists();
        populateForm(user?.pincode);
      }
    });
    return unsubscribe;
  }, [route]);

  useEffect(() => {
    if (!isSpecialityPristine.current) {
      fetchFilteredDoctors(filters.pincode);
      set_activeSpeciality(null);
    } else {
      isSpecialityPristine.current = false;
    }
  }, [Specialities]);

  useEffect(() => {
    set_Doctors(filterDoctorsByActiveSpeciality(DoctorsList, activeSpeciality));
  }, [DoctorsList]);

  /* ===== Async API calls ===== */
  const loadSpecialists = async () => {
    try {
      const resp = await specialistsApi.getAllSpecialist();
      if (resp?.ok) {
        if (resp?.data?.length) {
          const sorted = characterSort(resp.data, 'title');
          ALL_SPECIALITIES = sorted;
          loadFilteredDoctors(UserPincode);
        }
      } else {
        setError(resp?.data?.errors?.[0]?.msg || 'Error loading specialities');
      }
    } catch (error) {
      console.log('Error loading specialities', error);
      setError(error);
    }
    setIsLoading(false);
  };

  const loadFilteredDoctors = async (pincode) => {
    const payload = {
      pincode,
      distanceKM: selected_filter_distance?.max,
    };
    const docList = await getFilteredDoctors(payload);
    loadSearchItems(docList);
    route?.params?.specialistsArray
      ? set_Specialities(route.params.specialistsArray)
      : set_DoctorsList(docList);
  };

  const getFilteredDoctors = async (payload) => {
    let filtDocs = [];
    if (isLoading) setIsLoading(true);
    try {
      const resp = await doctorsApi.getDoctorFiltered(user._id, payload);
      if (resp?.ok) {
        if (resp?.data) {
          filtDocs = resp.data;
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg ||
            'Error in fetching filtered doctors list',
        );
      }
    } catch (error) {
      console.error('Error in fetching filtered doctors list', error);
      setError(error || 'Error in fetching filtered doctors list');
    }
    setIsLoading(false);
    return filtDocs;
  };

  const loadSearchItems = async (allDocList) => {
    SPECIALITY_DOCT_COUNT = groupBySpeciality(allDocList, 'specialityId');
    appendDoctorsCount(ALL_SPECIALITIES, SPECIALITY_DOCT_COUNT, '_id');
    try {
      const resp = await searchApi.getAllSearchItems();
      if (resp?.ok) {
        if (resp?.data?.length) {
          const searchItems = resp.data;
          const searches_grouped = groupSearchesByCount(
            searchItems,
            'specialityId',
          );
          appendDoctorsCount(
            searches_grouped,
            SPECIALITY_DOCT_COUNT,
            'specialityId',
          );
          const searches_sorted = numericSort([...searches_grouped], 'count');
          RECENT_POPULAR_SEARCHES = [
            {
              key: 'recent',
              title: 'Recent Searches',
              data: searches_grouped,
            },
            {
              key: 'popular',
              title: 'Popular Speciality',
              data: searches_sorted,
            },
          ];
        }
      } else {
        setError(resp?.data?.errors?.[0]?.msg || 'Error loading search items');
      }
    } catch (error) {
      console.log('Error loading search items', error);
      setError(error);
    }
  };

  /* ===== Functions ===== */
  function characterSort(inArr, _key) {
    const outArr = [...inArr].sort((a, b) => {
      let fa = a[_key].toLowerCase(),
        fb = b[_key].toLowerCase();
      return fa !== fb ? (fa < fb ? -1 : 1) : 0;
    });
    return outArr;
  }

  function groupSearchesByCount(listIn, _key) {
    const listOut = [];
    let fIndex = -1;
    for (let i = 0; i < listIn?.length; i++) {
      fIndex = listOut.findIndex((item) => item[_key] === listIn[i][_key]);
      if (fIndex === -1) listOut.push({...listIn[i], count: 1});
      else listOut[fIndex].count++;
    }
    return listOut;
  }

  function numericSort(inArr, _key) {
    return inArr.sort((a, b) => Number(b[_key]) - Number(a[_key]));
  }

  function groupBySpeciality(listIn, keyIn) {
    const objectOut = {};
    let _key;
    for (let i = 0; i < listIn?.length; i++) {
      _key = listIn[i]?.[keyIn];
      !objectOut[_key] ? (objectOut[_key] = 1) : objectOut[_key]++;
    }
    return objectOut;
  }

  function appendDoctorsCount(_list, objectIn, keyIn) {
    for (let i = 0; i < _list.length; i++) {
      _list[i]['doctor_count'] = objectIn.hasOwnProperty(_list[i][keyIn])
        ? objectIn[_list[i][keyIn]]
        : 0;
    }
  }

  /* ===== Speciality Merge ===== */

  const addItemToSpeciality = (speclty) => {
    if (speclty && speclty._id) {
      if (!Specialities.some((item) => item._id === speclty._id))
        set_Specialities([...Specialities, speclty]);
    }
  };

  const removeItemFromSpeciality = (speclty) =>
    set_Specialities(Specialities.filter((item) => item._id !== speclty._id));

  /* ===== Filter ===== */

  function filterDoctorsByActiveSpeciality(inputList, spclty) {
    return spclty
      ? inputList.filter((item) => item?.speciality?._id === spclty?._id)
      : inputList;
  }

  const specialityPressed = (splty) => {
    if (splty?._id === activeSpeciality?._id) {
      set_activeSpeciality(null);
      set_Doctors(filterDoctorsByActiveSpeciality(DoctorsList, null));
    } else {
      set_activeSpeciality(splty);
      set_Doctors(filterDoctorsByActiveSpeciality(DoctorsList, splty));
    }
  };

  const navToSpecialist = () => {
    navigation.navigate('Specialist', {
      SpecialityIds: Specialities.map((item) => item._id),
      FILTERS: filters,
    });
  };

  /* ===== Form - Pincode filter ===== */
  function getFormData() {
    return {
      pincode: '',
    };
  }

  const formSchema = Yup.object().shape({
    pincode: Yup.string().matches(/^[1-9][0-9]{5}$/, 'Enter a valid Pincode.'),
  });

  function populateForm(pin_code) {
    set_FormDataObject({...FormDataObject, pincode: pin_code});
  }

  const submitForm = async (data) => {
    fetchFilteredDoctors(data.pincode);
  };

  /* ===== Check-Uncheck Filters ===== */
  const check_uncheck_filters = (filterKey) => {
    return (selectedVal) => {
      filters[filterKey] === selectedVal
        ? set_filters({...filters, [filterKey]: 0})
        : set_filters({...filters, [filterKey]: selectedVal});
    };
  };

  const fetchFilteredDoctors = async (pincode) => {
    const payload = {
      pincode,
      specialities: Specialities.map((item) => item._id),
      availability: selected_filter_availability?.keyword,
      consult_type: selected_filter_consult_type?.label,
      gender: selected_filter_gender?.label,
      consult_fees: selected_filter_consult_fees,
      distanceKM: selected_filter_distance?.max,
    };
    set_DoctorsList(await getFilteredDoctors(payload));
  };

  /* ===== Search ===== */
  const searchInputFocused = (event) => {
    if (!event._dispatchInstances.memoizedProps.text)
      set_searchData(RECENT_POPULAR_SEARCHES);
    set_showSearch(true);
  };

  const searchInputChanged = (text) => {
    set_searchText(text);
    let sg_data = [...ALL_SPECIALITIES],
      regExp = null;
    if (text) {
      regExp = new RegExp(text, 'i');
      sg_data = sg_data.filter((item) => regExp.test(item.title));
      set_searchData([{title: 'Suggestions', data: sg_data}]);
    } else {
      set_searchData(RECENT_POPULAR_SEARCHES);
    }
  };

  const addSearchItem = () => {
    let sg_data = [...ALL_SPECIALITIES],
      regExp;
    if (searchText) {
      regExp = new RegExp(searchText, 'i');
      sg_data = sg_data.filter((item) => regExp.test(item.title));
    }
    if (sg_data.length) {
      const resp = searchApi.addSearchItem({title: sg_data[0].title});
      if (!resp?.ok) {
        setError(resp?.data?.errors?.[0]?.msg || 'Error in adding search item');
      }
    }
  };

  function removeFromRecentSearch(item, section, keyIn) {
    RECENT_POPULAR_SEARCHES = RECENT_POPULAR_SEARCHES.map((sdItem) => {
      if (sdItem.key === section.key)
        section.data = sdItem.data.filter(
          (tuple) => tuple[keyIn] !== item[keyIn],
        );
      return sdItem;
    });
    set_searchData([...RECENT_POPULAR_SEARCHES]);
  }

  function openSearchDropdown() {
    set_showSearch(true);
    set_isScreenScrollable(false);
  }

  function closeSearchDropdown() {
    set_showSearch(false);
    set_isScreenScrollable(true);
  }

  const onSubmitEditing = () => {
    closeSearchDropdown();
    addSearchItem();
  };

  const searchItemSelected = (item) => {
    closeSearchDropdown();
    set_searchText(item.title);
    addItemToSpeciality(item);
  };

  const SearchResultSection = ({section: {title}}) => (
    <Text style={styles.search_result_head}>{title}</Text>
  );

  const SearchResultItem = ({item, index, section}) => {
    let item_last = index + 1 === section.data.length && {marginBottom: 20};
    return section.key === 'recent' ? (
      index < 2 ? (
        <View style={[styles.search_result_item_append, item_last]}>
          <TouchableOpacity onPress={() => searchItemSelected(item)}>
            <Text style={styles.search_result_text}>
              {item.title} ({item.doctor_count || 0})
            </Text>
          </TouchableOpacity>
          <AppButtonIconInner
            width={responsiveWidth(8)}
            borderRadius={30}
            btPress={() =>
              removeFromRecentSearch(item, section, 'specialityId')
            }>
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#999999',
                borderRadius: 50,
                ...AppStyles.centerXY,
              }}>
              <Image
                style={{
                  width: '55%',
                  height: '55%',
                  resizeMode: 'contain',
                }}
                source={IMG_CLOSE}
              />
            </View>
          </AppButtonIconInner>
        </View>
      ) : (
        <></>
      )
    ) : (
      <View style={[styles.search_result_item, item_last]}>
        <TouchableOpacity onPress={() => searchItemSelected(item)}>
          <Text style={styles.search_result_text}>
            {item.title} ({item.doctor_count || 0})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const searchKeyExtractor = (item, index) => item.title + index;

  const ResultItem = ({item}) => {
    return (
      <View style={styles.result_item}>
        <AppCardDoctor
          item={item}
          navigation={navigation}
          viewAll_pressed={addItemToSpeciality}
        />
      </View>
    );
  };

  return (
    <View
      style={{flex: 1}}
      onStartShouldSetResponderCapture={(event) => {
        closeSearchDropdown();
      }}>
      <LoadingIndicator visible={isLoading} />
      <ScreenScrollable
        style={styles.mainContainer}
        scrollEnabled={isScreenScrollable}
        keyboardShouldPersistTaps="handled"
        // passOffsetY={set_scrollViewOffsetY}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <AppHeading>{t('find_doctor')}</AppHeading>
          </View>

          <View style={styles.sub_header}>
            <AppPara style={styles.sub_title}>
            {t('find_the_best')}
            </AppPara>
          </View>

          {error !== '' && (
            <View>
              <AppErrorMessage showMsg={true} error={error} />
            </View>
          )}

          <View style={styles.search_section}>
            <AppInputAppend
              isAppend={true}
              isShadowInner={true}
              appendWidth={responsiveWidth(9)}
              appendBgColor={BgColor_Search}
              appendSrc={Image_Search}
              appendClick={() => {
                closeSearchDropdown();
                Keyboard.dismiss;
              }}
              keyboardType="default"
              placeholder={t('search_speciality')}
              value={searchText}
              onFocus={searchInputFocused}
              onChangeText={searchInputChanged}
              onSubmitEditing={onSubmitEditing}
              fontSize={responsiveFontSize(2.2)}
              style={styles.searchInput}
            />

            {showSearch && (
              <View
                style={styles.search_result}
                onStartShouldSetResponderCapture={(event) => {
                  openSearchDropdown();
                  /* if (!isScreenScrollable && scrollViewOffsetY < 1)
                      set_isScreenScrollable(true); */
                  /* if (scrollViewOffsetY && !isScreenScrollable)
                      set_isScreenScrollable(true); */
                }}>
                <SectionList
                  /* onScroll={(event) => {
                      set_scrollViewOffsetY(event.nativeEvent.contentOffset.y);
                    }} */
                  sections={searchData}
                  renderItem={SearchResultItem}
                  keyExtractor={searchKeyExtractor}
                  renderSectionHeader={SearchResultSection}
                  initialNumToRender={2}
                  style={styles.search_result_list}
                />
              </View>
            )}
          </View>

          <View style={styles.pills_section}>
            {Specialities?.map((item, index) => (
              <AppButtonSecondary
                isPressed={item._id === activeSpeciality?._id}
                key={'specialities-' + index}
                width={(item.title.length + 6) * 0.02 * responsiveWidth(100)}
                height={30}
                shadowRadius={1}
                borderRadius={5}
                fontSize={responsiveFontSize(1.6)}
                style={styles.search_pill}
                btPress={() => specialityPressed(item)}>
                <View style={{flexDirection: 'row', ...AppStyles.centerXY}}>
                  <Text
                    style={{
                      ...GetTextStyle('#0D6BC8', 1.6),
                      marginRight: 4,
                    }}>
                    {item.title.toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItemFromSpeciality(item)}>
                    <View style={styles.pill_remove}>
                      <AutoHeightImage
                        width={12}
                        source={require('../assets/images/close_icon.png')}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </AppButtonSecondary>
            ))}
          </View>

          <View style={{marginBottom: 50, alignItems: 'center'}}>
            <AppButtonSecondary
              width={responsiveWidth(45)}
              height={30}
              shadowRadius={1}
              borderRadius={5}
              btPress={navToSpecialist}>
              <View style={{flexDirection: 'row', ...AppStyles.centerXY}}>
                <Text
                  style={{
                    ...GetTextStyle('#0D6BC8', 1.6),
                    marginRight: 5,
                  }}>
                  {t("view_speciality")}
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
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 25,
            }}>
            <AppPara style={styles.section_title}>{t("doctors_near")}</AppPara>
            <View style={{flexDirection: 'row'}}>
              <AppForm
                initialValues={FormDataObject}
                validationSchema={formSchema}
                onSubmit={submitForm}>
                <AppFormInput
                  onValueChange={(pincode) =>
                    set_filters({...filters, pincode})
                  }
                  name="pincode"
                  keyboardType="number-pad"
                  placeholder={t('pincode')}
                  height={32}
                  style={styles.pincode_input}
                  style_inner={{paddingHorizontal: 5}}
                  style_error={{position: 'absolute', bottom: -20}}
                />
                <AppFormButton
                  ButtonElement={({btPress}) => (
                    <AppButtonIcon
                      width={30}
                      shadowRadius={2}
                      borderRadius={5}
                      style={{marginLeft: 5}}
                      btPress={btPress}>
                      <Image
                        style={{width: '43%', resizeMode: 'contain'}}
                        source={require('../assets/images/icon_search_grey.png')}
                      />
                    </AppButtonIcon>
                  )}
                />
              </AppForm>
            </View>
            <AppButtonIcon
              width={30}
              shadowRadius={2}
              borderRadius={5}
              style={{marginLeft: 'auto'}}
              btPress={() => ref_bottomPopup.current.open()}>
              <Image
                style={{width: '43%', resizeMode: 'contain'}}
                source={require('../assets/images/icon_filter.png')}
              />
            </AppButtonIcon>
          </View>

          <View style={styles.result_section}>
            {Doctors?.length ? (
              Doctors.map((item, index) => (
                <ResultItem key={'doctor-' + index} item={item} />
              ))
            ) : (
              <Text>No Doctors Found</Text>
            )}
          </View>
        </View>
      </ScreenScrollable>

      <AppModalBottomUp
        ref={ref_bottomPopup}
        height={670}
        style_content={{flex: 1, paddingHorizontal: 0}}>
        <ScrollView contentContainerStyle={{paddingHorizontal: 30}}>
          <View>
            <Text style={styles.title_text}>{t('consultation_type')}</Text>
            <View style={{flexDirection: 'row'}}>
              {filterData?.consult_type?.length &&
                filterData.consult_type.map((item, index) => (
                  <AppRadioInputPlus
                    key={'filter-consult-type-' + index}
                    radioId={item.id}
                    checkedRadio={filters.consult_type}
                    setCheckedRadio={check_uncheck_filters('consult_type')}
                    wrapperStyle={{flex: 1}}
                    RdLabelElement={RadioLabel(
                      item,
                      AppStyles.colors.blue,
                      '#555555',
                      t
                    )}
                  />
                ))}
            </View>
          </View>

          <DividerX style={{marginVertical: 30}} />

          <View>
            <Text style={styles.title_text}>{t('availability')}</Text>
            <View>
              {filterData?.availability?.length &&
                filterData.availability.map((item, index) => (
                  <AppRadioInputPlus
                    key={'filter-available-' + index}
                    radioId={item.id}
                    checkedRadio={filters.availability}
                    setCheckedRadio={check_uncheck_filters('availability')}
                    RdLabel={t(item.keyword)}
                    labelStyle={{fontSize: responsiveFontSize(2.0)}}
                    colorUnchecked={'#555555'}
                    wrapperStyle={
                      index + 1 === filterData.availability.length
                        ? {}
                        : {marginBottom: 10}
                    }
                  />
                ))}
            </View>
          </View>

          <DividerX style={{marginVertical: 30}} />

          <View>
            <Text style={styles.title_text}>{t('gender')}</Text>
            <View style={{flexDirection: 'row'}}>
              {filterData?.gender?.length &&
                filterData.gender.map((item, index) => (
                  <AppRadioInputPlus
                    key={'filter-gender-' + index}
                    radioId={item.id}
                    checkedRadio={filters.gender}
                    setCheckedRadio={check_uncheck_filters('gender')}
                    wrapperStyle={{flex: 1}}
                    RdLabelElement={RadioLabel_1(
                      item,
                      AppStyles.colors.blue,
                      '#555555',
                      t
                    )}
                  />
                ))}
            </View>
          </View>

          <DividerX style={{marginVertical: 30}} />

          <View>
            <Text style={styles.title_text}>{t('consult_fees')}</Text>
            <View>
              {filterData?.consult_fees?.length &&
                filterData.consult_fees.map((item, index) => (
                  <AppRadioInputPlus
                    key={'filter-consult-fees' + index}
                    radioId={item.id}
                    checkedRadio={filters.consult_fees}
                    setCheckedRadio={check_uncheck_filters('consult_fees')}
                    wrapperStyle={
                      index + 1 === filterData.consult_fees.length
                        ? {}
                        : {marginBottom: 10}
                    }
                    RdLabelElement={RadioLabel_2(
                      item,
                      AppStyles.colors.blue,
                      '#555555',
                    )}
                  />
                ))}
            </View>
          </View>

          <DividerX style={{marginVertical: 30}} />

          <View style={{marginBottom: 40}}>
            <Text style={styles.title_text}>{t('distance')}</Text>
            <View>
              {filterData?.distance?.length &&
                filterData.distance.map((item, index) => (
                  <AppRadioInputPlus
                    key={'filter-distance-' + index}
                    radioId={item.id}
                    checkedRadio={filters.distance}
                    setCheckedRadio={check_uncheck_filters('distance')}
                    wrapperStyle={
                      index + 1 === filterData.distance.length
                        ? {}
                        : {marginBottom: 10}
                    }
                    RdLabelElement={RadioLabel_3(
                      item,
                      AppStyles.colors.blue,
                      '#555555',
                    )}
                  />
                ))}
            </View>
          </View>

          <AppButtonPrimary
            width={responsiveWidth(100) * 0.58}
            btTitle={'APPLY'}
            aspect_ratio={0.21}
            style={{alignSelf: 'center', marginBottom: 15}}
            btPress={() => {
              fetchFilteredDoctors(filters.pincode);
              ref_bottomPopup.current.close();
            }}
          />
        </ScrollView>
      </AppModalBottomUp>
    </View>
  );
}

const RadioLabel = (item, colorChecked, colorUnchecked, t) => ({isActive}) => (
  <View style={styles.radio_label}>
    <View style={styles.radio_label_row}>
      <Text
        style={{
          ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
          marginRight: 5,
        }}>
        {t(item.keyword)}
        
      </Text>
      <MaterialCommunityIcons
        name={item.icon}
        style={GetTextStyle(isActive ? colorChecked : colorUnchecked, 3)}
      />
    </View>
  </View>
);

const RadioLabel_1 = (item, colorChecked, colorUnchecked, t) => ({isActive}) => (
  <View style={styles.radio_label}>
    <View style={styles.radio_label_row}>
      <Text
        style={{
          ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
          marginRight: 5,
        }}>
        {t(item.label)}
      </Text>
      <SimpleLineIcons
        name={item.icon}
        style={GetTextStyle(isActive ? colorChecked : colorUnchecked, 3)}
      />
    </View>
  </View>
);

const RadioLabel_2 = (item, colorChecked, colorUnchecked) => ({isActive}) =>
  item.min === 0 && item.max === 0 ? (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      Free
    </Text>
  ) : item.max === 'infinity' ? (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      {'> ' + item.min}
    </Text>
  ) : (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      {item.min + ' - ' + item.max}
    </Text>
  );

const RadioLabel_3 = (item, colorChecked, colorUnchecked) => ({isActive}) =>
  item.min === 0 && item.max === 0 ? (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      Free
    </Text>
  ) : item.max === 'infinity' ? (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      {'Anywhere'}
    </Text>
  ) : (
    <Text
      style={{
        ...GetTextStyle(isActive ? colorChecked : colorUnchecked, 2.0),
        marginLeft: 5,
      }}>
      {'Upto ' + item.max}
    </Text>
  );

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 15,
    paddingBottom: 30,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sub_header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sub_title: {
    width: '86%',
    fontSize: responsiveFontSize(2.0),
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  search_section: {
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
    top: WIDTH * 0.28,
  },
  search_result_list: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  search_result_head: {
    ...GetTextStyle(undefined, 1.85),
    marginBottom: 10,
  },
  search_result_item: {
    marginBottom: 12,
  },
  search_result_item_append: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  search_result_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2),
  },
  pills_section: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  search_pill: {
    marginVertical: 8,
    marginHorizontal: 5,
  },
  pill_remove: {
    backgroundColor: 'transparent',
    width: 26,
    height: '100%',
    marginRight: -10,
    ...AppStyles.centerXY,
  },
  section_title: {
    fontSize: responsiveFontSize(2.0),
    marginRight: 10,
  },
  pincode_input: {
    width: responsiveWidth(100) * 0.24,
    height: 32,
    borderRadius: 5,
    fontSize: responsiveFontSize(2.0),
  },
  result_section: {
    marginBottom: 0,
  },
  result_item: {marginBottom: 25},
  title_text: {
    ...GetTextStyle(AppStyles.colors.darkgrey, 1.7),
    marginBottom: 10,
  },
  radio_label_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio_label: {
    marginLeft: 5,
  },
});
