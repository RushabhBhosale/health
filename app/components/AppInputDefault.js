import React from 'react';
import {StyleSheet, View, Text, TextInput, Image} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppFormError from './AppFormError';
import AppStyles, {
  IsAndroid,
  Container_Width,
  Input_Aspect_Ratio,
} from '../config/style';

export default function AppInputDefault({
  isInputValid = false,
  showMsg = false,
  error = '',
  ...otherProps
}) {
  let {
    isPrepend,
    prependText,
    prependElement,
    prepDivider = false,
    hasAppend,
    appendText,
    appendElement,
    appnDivider = false,
    isAppend = false,
    appendWidth = responsiveWidth(7),
    appendSrc = require('../assets/images/icon_checked.png'),
    aspect_ratio = Input_Aspect_Ratio,
    style = {},
    style_inner = {},
    style_error = {},
  } = otherProps;

  let {width = Container_Width, fontSize = 18, borderRadius = 15} = style;

  prependElement =
    prependElement ||
    (prependText && (
      <View>
        <Text style={[AppStyles.text, {fontSize}]}>{prependText}</Text>
      </View>
    ));

  appendElement =
    appendElement ||
    (appendText && (
      <View>
        <Text style={[AppStyles.text, {fontSize}]}>{appendText}</Text>
      </View>
    ));

  return (
    <>
      <Neomorph
        inner={IsAndroid}
        style={{
          ...styles.neoMorph,
          ...style,
          width,
          height: style.height || width * aspect_ratio,
        }}>
        <View style={[styles.inputWrapper, style_inner, {borderRadius}]}>
          {isPrepend && prependElement}

          {prepDivider && <View style={styles.dividerWrap}></View>}

          <View style={styles.inputWrap}>
            <TextInput
              {...otherProps}
              style={[AppStyles.text, styles.textInput, {fontSize}]}
              placeholderTextColor={AppStyles.colors.darkgrey_op_50}
              underlineColorAndroid="transparent"
            />
          </View>

          {appnDivider && <View style={styles.dividerWrap}></View>}

          {hasAppend && appendElement}

          {isAppend && isInputValid && (
            <View
              style={{
                ...styles.appendWrap,
                width: appendWidth,
                height: appendWidth,
              }}>
              <Image
                style={{
                  ...styles.appendElem,
                  width: appendWidth,
                  height: appendWidth,
                }}
                source={appendSrc}
              />
            </View>
          )}
        </View>
      </Neomorph>
      <AppFormError showMsg={showMsg} error={error} style={style_error} />
    </>
  );
}

const styles = StyleSheet.create({
  neoMorph: {
    shadowRadius: 3,
    borderRadius: 15,
    backgroundColor: AppStyles.colors.lightgrey,
    ...AppStyles.centerXY,
  },
  inputWrapper: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dividerWrap: {
    width: 1,
    height: '80%',
    backgroundColor: '#bcbcbc',
    marginHorizontal: 15,
  },
  inputWrap: {
    flex: 1,
  },
  textInput: {
    padding: 0,
    paddingHorizontal: 5,
  },
  appendWrap: {
    borderRadius: 25,
    shadowRadius: 2,
    backgroundColor: AppStyles.colors.lightgrey,
    marginLeft: 15,
    ...AppStyles.centerXY,
  },
  appendElem: {
    resizeMode: 'contain',
  },
});
