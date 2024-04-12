import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppFormError from './AppFormError';
import AppStyles, {
  IsAndroid,
  Container_Width,
  Input_Aspect_Ratio,
} from '../config/style';

export default function AppInputAppend({
  showMsg = false,
  error = '',
  inputPress = () => console.log('Input pressed...'),
  prependText,
  isAppend = false,
  isShadowInner = false,
  appendWidth = responsiveWidth(8),
  appendPadding = 10,
  appendBgColor = 'transparent',
  appendSrc = require('../assets/images/icon_checked.png'),
  appendImgWidth = '55%',
  appendClick = () => {},
  aspect_ratio = Input_Aspect_Ratio,
  fontSize = 18,
  style = {},
  style_inner = {},
  style_input = {},
  style_append = {},
  ...otherProps
}) {
  let {width = Container_Width, borderRadius = 15} = style;

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
        <TouchableOpacity onPress={inputPress}>
          <View style={[styles.inputWrapper, style_inner, {borderRadius}]}>
            {prependText && (
              <View>
                <Text style={[AppStyles.text, {fontSize}]}>{prependText}</Text>
              </View>
            )}

            {prependText && <View style={styles.dividerWrap}></View>}

            <View style={styles.inputWrap}>
              <TextInput
                {...otherProps}
                style={[
                  AppStyles.text,
                  styles.textInput,
                  {fontSize},
                  style_input,
                ]}
                placeholderTextColor={AppStyles.colors.darkgrey_op_50}
                underlineColorAndroid="transparent"
              />
            </View>

            {isAppend && (
              <TouchableOpacity onPress={appendClick}>
                <Neomorph
                  inner={isShadowInner && IsAndroid}
                  style={{
                    ...styles.neoMorphAppend,
                    width: appendWidth,
                    height: appendWidth,
                    marginLeft: 15,
                    ...style_append,
                  }}>
                  <Neomorph
                    style={{
                      ...styles.neoMorphAppend,
                      width: appendWidth - appendPadding,
                      height: appendWidth - appendPadding,
                    }}>
                    <View style={styles.appendWrap(appendBgColor)}>
                      <Image
                        style={styles.appendImage(appendImgWidth)}
                        source={appendSrc}
                      />
                    </View>
                  </Neomorph>
                </Neomorph>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Neomorph>
      <AppFormError showMsg={showMsg} error={error} />
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
    backgroundColor: AppStyles.colors.dividerY,
    marginHorizontal: 15,
  },
  inputWrap: {
    flex: 1,
  },
  textInput: {
    padding: 0,
    paddingHorizontal: 5,
  },
  neoMorphAppend: {
    borderRadius: 50,
    shadowRadius: 2,
    backgroundColor: AppStyles.colors.lightgrey,
    ...AppStyles.centerXY,
  },
  appendWrap: (bgColor) => ({
    backgroundColor: bgColor,
    width: '100%',
    height: '100%',
    borderRadius: 50,
    ...AppStyles.centerXY,
  }),
  appendImage: (width) => ({
    width: width,
    height: width,
    resizeMode: 'contain',
  }),
});
