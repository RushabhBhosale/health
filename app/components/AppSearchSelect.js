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
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';

const WIDTH = Container_Width;
const IMG_SEARCH = require('../assets/images/icon_search_grey.png');
const IMG_SEARCH_TRANS = require('../assets/images/icon_search_transparent.png');

export default function AppSearchSelect({
  isDisabled = false,
  data = [],
  isOpen = false,
  openSelect,
  searchText,
  optionLabel,
  inputFocused,
  inputChanged,
  searchButtonPressed = () => void 0,
  onSubmitEditing = () => void 0,
  itemSelected,
  place_holder = 'Enter Search Text',
  input_width = WIDTH,
  aspect_ratio,
  input_fontSize,
  dp_max_height = responsiveWidth(100) * 0.5,
  dp_top_factor = 0.2,
  is_drop_up = false,
  is_drop_over = false,
  drop_position = 0,
}) {
  const Image_Search = isOpen ? IMG_SEARCH_TRANS : IMG_SEARCH;
  const BgColor_Search = isOpen ? '#8BC641' : 'transparent';

  return (
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
        style={styles.searchInput}
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
            renderItem={SearchResultItem(optionLabel, itemSelected)}
            keyExtractor={searchKeyExtractor}
            ListEmptyComponent={
              <Text style={styles.no_search_result}>No Result</Text>
            }
            style={styles.sdp_list}
          />
        </View>
      )}
    </View>
  );
}

const SearchResultItem =
  (optionLabel, itemSelected) =>
  ({item, index}) => {
    return (
      <View style={styles.sdp_item}>
        {index === 0 ? (
          <Text style={styles.sdp_heading}>Suggestions</Text>
        ) : null}
        <TouchableOpacity onPress={() => itemSelected(item)}>
          <Text style={styles.sdp_text}>{item[optionLabel]}</Text>
        </TouchableOpacity>
      </View>
    );
  };

const searchKeyExtractor = (item, index) => 'search-item-' + index;

const styles = StyleSheet.create({
  searchInput: {
    width: WIDTH,
    fontSize: responsiveFontSize(2.2),
    zIndex: 1,
  },
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
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sdp_item: {
    paddingVertical: 5,
  },
  sdp_heading: {
    ...GetTextStyle(undefined, 1.75),
    marginBottom: 11,
  },
  sdp_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.0),
  },
  no_search_result: {
    ...GetTextStyle('#888888', 2, undefined, 'center'),
  },
});
