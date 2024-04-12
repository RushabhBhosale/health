import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppBoxShadowInner from './AppBoxShadowInner';
import AppButtonIcon from './AppButtonIcon';
import AppFormError from './AppFormError';
import AppStyles, {Container_Width, GetTextStyle} from '../config/style';

const WIDTH = Container_Width;

export default function AppSelectInput({
  isDisabled = false,
  data = [],
  isOpen = false,
  openSelect,
  closeSelect,
  selectedOption,
  optionLabel,
  set_selectedOption,
  place_holder,
  place_holder_option = 'Select an option',
  width = Container_Width,
  aspect_ratio = 0.22,
  select_input_style = {},
  select_text_style = {},
  select_placeholder_style = {},
  dp_max_height = responsiveWidth(100) * 0.94,
  dp_top_factor = 0.2,
  is_drop_up = false,
  is_drop_over = false,
  drop_position = 0,
  showMsg = false,
  error = '',
  style_error = {},
  noDataText = 'No Data Available',
  style_noDataTxt = {},
}) {
  place_holder = selectedOption?.[optionLabel] ? (
    <Text style={[styles.select_input_text, select_text_style]}>
      {selectedOption[optionLabel]}
    </Text>
  ) : place_holder ? (
    place_holder
  ) : (
    <Text style={[styles.select_input_placeholder, select_placeholder_style]}>
      {place_holder_option}
    </Text>
  );

  return (
    <>
      <View>
        <AppBoxShadowInner
          width={width}
          aspect_ratio={aspect_ratio}
          content_style={{...styles.select_input, ...select_input_style}}>
          <TouchableOpacity
            onPress={isDisabled ? null : () => openSelect()}
            style={styles.select_input_wrap}>
            {place_holder}
          </TouchableOpacity>
          <AppButtonIcon
            width={responsiveWidth(100) * 0.05}
            borderRadius={30}
            btPress={isDisabled ? null : () => openSelect()}>
            <View style={styles.select_icon_wrap}>
              <Image
                style={{width: '160%', resizeMode: 'contain'}}
                source={require('../assets/images/arrow-dropdown.png')}
              />
            </View>
          </AppButtonIcon>
        </AppBoxShadowInner>
        {isOpen && (
          <View
            style={[
              styles.select_dropdown(dp_max_height),
              styles.dropdown_position(
                is_drop_up,
                is_drop_over,
                drop_position,
                dp_top_factor,
                width,
                aspect_ratio,
              ),
            ]}
            onStartShouldSetResponderCapture={(event) => openSelect()}>
            <ScrollView
              nestedScrollEnabled={true}
              contentContainerStyle={styles.select_dropdown_list}>
              {data.length ? (
                data.map(
                  SelectDropdownItem(
                    data.length,
                    optionLabel,
                    set_selectedOption,
                    closeSelect,
                    place_holder_option,
                  ),
                )
              ) : (
                <Text style={[styles.no_data_text, style_noDataTxt]}>
                  {noDataText}
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
      <AppFormError showMsg={showMsg} error={error} style={style_error} />
    </>
  );
}

const SelectDropdownItem =
  (
    totalItems,
    optionLabel,
    setSelectedItem,
    closeSelect,
    place_holder_option,
  ) =>
  (item, index) => {
    let last_item = index + 1 === totalItems ? {marginBottom: 0} : {};
    return (
      <View key={'select-item-' + index}>
        {index === 0 ? (
          <View style={styles.select_dropdown_item}>
            <Text style={styles.select_dropdown_placeholder}>
              {place_holder_option}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            setSelectedItem(item);
            closeSelect();
          }}>
          <View style={[styles.select_dropdown_item, last_item]}>
            <Text style={styles.select_dropdown_text} numberOfLines={1}>
              {item[optionLabel]}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
  select_input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  select_input_wrap: {
    flex: 1,
  },
  select_input_text: {
    ...GetTextStyle(AppStyles.colors.blue, 2.0),
    padding: 0,
    paddingHorizontal: 5,
  },
  select_input_placeholder: {
    ...GetTextStyle(AppStyles.colors.darkgrey_op_50, 2),
  },
  select_icon_wrap: {
    ...AppStyles.centerXY,
    backgroundColor: AppStyles.colors.oliveGreen,
    width: responsiveWidth(100) * 0.05,
    aspectRatio: 1 / 1,
    borderRadius: 30,
  },
  select_dropdown: (maxHeight) => ({
    backgroundColor: 'white',
    maxHeight,
    marginTop: 15,
    borderRadius: 15,
    position: 'absolute',
    zIndex: 20000,
    width: '100%',
  }),
  dropdown_position: (
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
  select_dropdown_list: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  select_dropdown_item: {
    marginBottom: 12,
  },
  select_dropdown_text: {
    ...GetTextStyle(AppStyles.colors.linkcolor, 2.2),
  },
  select_dropdown_placeholder: {
    ...GetTextStyle('#888888', 2.0),
  },
  no_data_text: {
    ...GetTextStyle('#888888', 2.0, undefined, 'center'),
  },
});
