import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppInputAppend from './AppInputAppend';
import AppFormError from './AppFormError';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';

const WIDTH = Container_Width;
const IMG_SEARCH = require('../assets/images/icon_search_grey.png');
const IMG_SEARCH_TRANS = require('../assets/images/icon_search_transparent.png');

export default function AppSearchSelectMulti({
  isDisabled = false,
  data = [],
  isOpen = false,
  openSelect,
  searchText,
  optionLabel,
  optionKey,
  selectedItems,
  itemSelected,
  inputFocused,
  inputChanged,
  searchButtonPressed = () => void 0,
  onSubmitEditing = () => void 0,
  place_holder = 'Enter Search Text',
  dpCaptionText = 'Select options',
  select_color = AppStyles.colors.blue,
  unselect_color = AppStyles.colors.grey03,
  input_width = WIDTH,
  aspect_ratio,
  input_fontSize = responsiveFontSize(2.0),
  dp_max_height = responsiveWidth(100) * 0.5,
  dp_top_factor = 0.2,
  is_drop_up = false,
  is_drop_over = false,
  drop_position = 0,
  showMsg = false,
  error = '',
  style_error = {},
}) {
  const Image_Search = isOpen ? IMG_SEARCH_TRANS : IMG_SEARCH;
  const BgColor_Search = isOpen ? '#8BC641' : 'transparent';

  return (
    <>
      <View>
        <AppInputAppend
          editable={!isDisabled}
          isAppend={true}
          isShadowInner={true}
          appendWidth={responsiveWidth(9)}
          appendBgColor={BgColor_Search}
          appendSrc={Image_Search}
          appendClick={() => {
            searchButtonPressed();
            Keyboard.dismiss;
          }}
          keyboardType="default"
          placeholder={place_holder}
          value={searchText}
          onFocus={inputFocused}
          onChangeText={inputChanged}
          onSubmitEditing={onSubmitEditing}
          aspect_ratio={aspect_ratio}
          fontSize={input_fontSize}
          style={styles.searchInput(input_width)}
        />
        {isOpen && (
          <View
            style={[
              styles.search_dropdown(dp_max_height),
              styles.sdp_position(
                is_drop_up,
                is_drop_over,
                drop_position,
                dp_top_factor,
                input_width,
                aspect_ratio,
              ),
            ]}
            onStartShouldSetResponderCapture={(event) => openSelect()}>
            <FlatList
              data={data}
              renderItem={SearchResultItem(
                data.length,
                optionLabel,
                optionKey,
                selectedItems,
                itemSelected,
                select_color,
                unselect_color,
                dpCaptionText,
              )}
              keyExtractor={searchKeyExtractor}
              ListEmptyComponent={
                <Text style={styles.no_search_result}>No Result</Text>
              }
              style={styles.sdp_list}
            />
          </View>
        )}
      </View>
      <AppFormError showMsg={showMsg} error={error} style={style_error} />
    </>
  );
}

const SearchResultItem =
  (
    totalItems,
    optionLabel,
    optionKey,
    selectedItems,
    itemSelected,
    select_color,
    unselect_color,
    dpCaptionText,
  ) =>
  ({item, index}) => {
    let last_item = index + 1 === totalItems ? {marginBottom: 0} : {};
    return (
      <View style={styles.sdp_item_wrap}>
        {index === 0 ? (
          <View style={styles.sdp_item}>
            <Text style={styles.sdp_caption}>{dpCaptionText}</Text>
          </View>
        ) : null}
        <TouchableOpacity onPress={() => itemSelected(item)}>
          <View style={[styles.sdp_item, last_item]}>
            <Text style={styles.sdp_text} numberOfLines={2}>
              {item[optionLabel]}
            </Text>
            <View
              style={{
                width: responsiveWidth(100) * 0.04,
                height: responsiveWidth(100) * 0.04,
                borderRadius: 30,
                ...AppStyles.centerXY,
              }}>
              {selectedItems.includes(item[optionKey]) ? (
                <View style={styles.sdp_option_select(select_color)}></View>
              ) : (
                <View style={styles.sdp_option_select(unselect_color)}></View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

const searchKeyExtractor = (item, index) => 'search-item-' + index;

const styles = StyleSheet.create({
  searchInput: (width) => ({
    width,
    fontSize: responsiveFontSize(2.2),
    zIndex: 1,
  }),
  search_dropdown: (maxHeight) => ({
    backgroundColor: 'white',
    maxHeight,
    marginTop: 15,
    borderRadius: 15,
    position: 'absolute',
    zIndex: 10000,
    width: '100%',
  }),
  sdp_position: (
    is_drop_up,
    is_drop_over,
    drop_position,
    top_factor,
    input_wd,
    input_asp_rat,
  ) =>
    is_drop_up
      ? is_drop_over
        ? {bottom: drop_position}
        : {bottom: input_wd * input_asp_rat}
      : is_drop_over
      ? {top: drop_position}
      : {top: WIDTH * top_factor},
  sdp_list: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sdp_item_wrap: {},
  sdp_caption: {
    ...GetTextStyle('#888888', 2.0),
  },
  sdp_item: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sdp_text: {
    flexShrink: 1,
    marginRight: 5,
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.0),
  },
  sdp_option_select: (bgColor) => ({
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: bgColor,
  }),
  no_search_result: {
    ...GetTextStyle('#888888', 2, undefined, 'center'),
  },
});
