import React from 'react';
import {StyleSheet, Text, View, TouchableWithoutFeedback} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppStyles, {IsAndroid} from '../config/style';

export default function AppRadioInput({
  RdLabel,
  RdLabelElement,
  radioId,
  checkedRadio,
  setCheckedRadio,
  colorChecked = AppStyles.colors.blue,
  wrapperStyle,
  outerWidth = responsiveWidth(7),
  innerWidth = responsiveWidth(4.5),
}) {
  RdLabelElement = RdLabelElement || (
    <Text style={styles.radio_label}>{RdLabel}</Text>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setCheckedRadio(radioId);
      }}>
      <View style={[styles.radio_wrapper, wrapperStyle]}>
        <Neomorph inner={IsAndroid} style={styles.radio_item(outerWidth)}>
          {radioId === checkedRadio ? (
            <Neomorph
              style={{
                ...styles.radio_item_inner(innerWidth),
                backgroundColor: colorChecked,
              }}
            />
          ) : (
            <></>
          )}
        </Neomorph>
        {RdLabelElement}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  radio_wrapper: {marginBottom: 30, flexDirection: 'row', alignItems: 'center'},
  radio_item: (width) => ({
    shadowRadius: 2,
    borderRadius: 25,
    backgroundColor: AppStyles.colors.lightgrey,
    width,
    height: width,
    marginHorizontal: responsiveWidth(1),
    ...AppStyles.centerXY,
  }),
  radio_item_inner: (width) => ({
    shadowRadius: 1,
    borderRadius: 25,
    width,
    height: width,
    ...AppStyles.centerXY,
  }),
  radio_label: {
    fontSize: responsiveFontSize(2.0),
    color: AppStyles.colors.darkgrey,
    marginLeft: responsiveWidth(2),
  },
});
