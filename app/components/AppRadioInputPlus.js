import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppStyles, {IsAndroid, GetTextStyle} from '../config/style';

export default function AppRadioInputPlus({
  isDisabled = false,
  RdElementImg,
  RdLabel,
  labelStyle,
  RdLabelElement,
  radioId,
  checkedRadio,
  setCheckedRadio,
  outerRadioBackground = '#E7EDF0',
  colorChecked = AppStyles.colors.blue,
  colorUnchecked = '#5E5E5E',
  wrapperStyle,
  radioStyle,
  outerWidth = responsiveWidth(7),
  innerWidth = responsiveWidth(4.5),
}) {
  const isActive = radioId === checkedRadio;
  let labelFontSize = 2.0;

  let RdElement = RdElementImg ? (
    <Image source={RdElementImg} style={styles.radio_item_image(innerWidth)} />
  ) : (
    <Neomorph
      style={{
        ...styles.radio_item_inner(innerWidth),
        backgroundColor: !isDisabled ? colorChecked : colorUnchecked,
      }}
    />
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        !isDisabled ? setCheckedRadio(radioId) : null;
      }}>
      <View style={[styles.radio_wrapper, wrapperStyle]}>
        <Neomorph
          inner={IsAndroid}
          style={{
            ...styles.radio_item(outerWidth),
            ...radioStyle,
            backgroundColor: outerRadioBackground,
          }}>
          {isActive ? RdElement : <></>}
        </Neomorph>
        {RdLabelElement ? (
          <RdLabelElement isActive={isActive} />
        ) : (
          <Text
            style={[
              styles.radio_label_txt(
                isDisabled,
                isActive,
                colorChecked,
                colorUnchecked,
                labelFontSize,
              ),
              labelStyle,
            ]}>
            {RdLabel}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  radio_wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio_item: (width) => ({
    shadowRadius: 2,
    borderRadius: 25,
    backgroundColor: AppStyles.colors.lightgrey,
    width,
    height: width,
    marginHorizontal: responsiveWidth(1),
    ...AppStyles.centerXY,
  }),
  radio_item_image: (width) => ({
    width,
    height: width,
  }),
  radio_item_inner: (width) => ({
    shadowRadius: 1,
    borderRadius: 25,
    width,
    height: width,
    ...AppStyles.centerXY,
  }),
  radio_label_txt: (
    isDisabled,
    isActive,
    colorChecked,
    colorUnchecked,
    fontSize,
  ) => ({
    ...GetTextStyle(
      !isDisabled && isActive ? colorChecked : colorUnchecked,
      fontSize,
    ),
    marginLeft: 5,
  }),
});
