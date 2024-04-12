import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppStyles, {IsAndroid} from '../config/style';

export default function AppProgresStep({
  isFirstDone = true,
  isSecondDone = false,
  colorDone = AppStyles.colors.oliveGreen,
  stepDots = 6,
}) {
  return (
    <View style={styles.step_wrapper}>
      <StepItem isDone={isFirstDone} colorDone={colorDone} label={1} />
      <StepDot size={stepDots} isDone={isSecondDone} colorDone={colorDone} />
      <StepItem isDone={isSecondDone} colorDone={colorDone} label={2} />
    </View>
  );
}

const StepItem = ({isDone, colorDone, label}) => {
  return (
    <Neomorph inner={IsAndroid} style={styles.step_item}>
      {isDone ? (
        <Neomorph
          style={{
            ...styles.step_item_inner,
            backgroundColor: colorDone,
          }}>
          <Text
            style={{
              ...styles.step_item_text,
              color: AppStyles.colors.white,
            }}>
            {label}
          </Text>
        </Neomorph>
      ) : (
        <Text style={styles.step_item_text}>{label}</Text>
      )}
    </Neomorph>
  );
};

const StepDot = ({size, isDone, colorDone}) => {
  let dotStyle = isDone
    ? {...styles.step_dot, backgroundColor: colorDone}
    : styles.step_dot;
  return Array.from({length: size}).map((_, i) => {
    return <View key={'dot_item' + i} style={dotStyle}></View>;
  });
};

const styles = StyleSheet.create({
  step_wrapper: {
    flex: 1,
    flexDirection: 'row',
    ...AppStyles.centerXY,
    position: 'absolute',
    left: AppStyles.windowWidth * 0.25,
    right: AppStyles.windowWidth * 0.25,
  },
  step_item: {
    shadowRadius: 2,
    borderRadius: 25,
    backgroundColor: AppStyles.colors.lightgrey,
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    marginHorizontal: responsiveWidth(1),
    ...AppStyles.centerXY,
  },
  step_item_inner: {
    shadowRadius: 1,
    borderRadius: 25,
    width: responsiveWidth(4.5),
    height: responsiveWidth(4.5),
    ...AppStyles.centerXY,
  },
  step_item_text: {
    color: AppStyles.colors.lightBlue01,
    fontSize: responsiveFontSize(1.5),
  },
  step_dot: {
    borderRadius: 25,
    width: 7,
    height: 7,
    backgroundColor: AppStyles.colors.grey03,
    marginHorizontal: responsiveWidth(1),
  },
});
