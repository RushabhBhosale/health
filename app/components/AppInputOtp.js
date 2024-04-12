import React, {useRef, useState, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput, Platform} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import AppStyles from '../config/style';

export default function AppInputOtp({
  wrapperWidth = '100%',
  controlWidth = 60,
  controlHeight = 70,
  backgroundColor = AppStyles.colors.oliveGreen,
  fontSize = 18,
  otpValue,
  setOtpValue,
}) {
  const firstTextInputRef = useRef(null);
  const secondTextInputRef = useRef(null);
  const thirdTextInputRef = useRef(null);
  const fourthTextInputRef = useRef(null);
  const fifthTextInputRef = useRef(null);
  const sixthTextInputRef = useRef(null);

  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [submittingOtp, setSubmittingOtp] = useState(false);

  const refCallback = (textInputRef) => (node) => {
    textInputRef.current = node;
  };

  useEffect(() => {
    if (otpValue) setOtpArray(otpValue.split(''));
  }, [otpValue, setOtpArray]);

  const onOtpChange = (index) => {
    return (value) => {
      if (isNaN(Number(value))) {
        // do nothing when a non digit is pressed
        return;
      }
      const otpArrayCopy = otpArray.concat();
      otpArrayCopy[index] = value;
      setOtpArray(otpArrayCopy);
      setOtpValue(otpArrayCopy.join(''));

      // console.log('sixthTextInputRef', sixthTextInputRef);

      // auto focus to next InputText if value is not blank
      if (value !== '') {
        if (index === 0) {
          secondTextInputRef.current.focus();
        } else if (index === 1) {
          thirdTextInputRef.current.focus();
        } else if (index === 2) {
          fourthTextInputRef.current.focus();
        } else if (index === 3) {
          fifthTextInputRef.current.focus();
        } else if (index === 4) {
          sixthTextInputRef.current.focus();
        }
      }
    };
  };

  // const onOtpKeyPress = (index) => {
  //   console.log('index',index);
  //   return ({nativeEvent: {key: value}}) => {
  //     console.log('value',value);
  //     // auto focus to previous InputText if value is blank and existing value is also blank
  //     if (value === 'Backspace' && otpArray[index] === '') {
  //       if (index === 1) {
  //         firstTextInputRef.current.focus();
  //       } else if (index === 2) {
  //         secondTextInputRef.current.focus();
  //       } else if (index === 3) {
  //         thirdTextInputRef.current.focus();
  //       } else if (index === 4) {
  //         fourthTextInputRef.current.focus();
  //       } else if (index === 5) {
  //         fifthTextInputRef.current.focus();
  //       }

  //       /**
  //        * clear the focused text box as well only on Android because on mweb onOtpChange will be also called
  //        * doing this thing for us
  //        * todo check this behaviour on ios
  //        */
  //       if (Platform.OS === 'android' && index > 0) {
  //         const otpArrayCopy = otpArray.concat();
  //         otpArrayCopy[index - 1] = ''; // clear the previous box which will be in focus
  //         setOtpArray(otpArrayCopy);
  //       }
  //     }
  //   };
  // };

  const focusPrevious = (key, index) => {
    // console.log('key', key);
    // console.log('index', index);
    if (key === 'Backspace' && index !== 0) {
      // console.log('index.in', index);
      //if (key === 'Backspace' && otpArray[index] === '') {
      if (index === 1) {
        firstTextInputRef.current.focus();
      } else if (index === 2) {
        secondTextInputRef.current.focus();
      } else if (index === 3) {
        thirdTextInputRef.current.focus();
      } else if (index === 4) {
        fourthTextInputRef.current.focus();
      } else if (index === 5) {
        fifthTextInputRef.current.focus();
      }

      /**
       * clear the focused text box as well only on Android because on mweb onOtpChange will be also called
       * doing this thing for us
       * todo check this behaviour on ios
       */
      if (Platform.OS === 'android' && index > 0) {
        const otpArrayCopy = otpArray.concat();
        otpArrayCopy[index - 1] = ''; // clear the previous box which will be in focus
        setOtpArray(otpArrayCopy);
        setOtpValue(otpArrayCopy.join(''));
      }
      //}
    }
    //this.otpTextInput[index - 1]._root.focus();
  };

  return (
    <View style={[styles.inputWrapper, {width: wrapperWidth}]}>
      {[
        firstTextInputRef,
        secondTextInputRef,
        thirdTextInputRef,
        fourthTextInputRef,
        fifthTextInputRef,
        sixthTextInputRef,
      ].map((textInputRef, index) => (
        <OtpInput
          key={'otp-input-' + index}
          index={index}
          fontSize={fontSize}
          controlWidth={controlWidth}
          controlHeight={controlHeight}
          backgroundColor={backgroundColor}
          textInputRef={textInputRef}
          refCallback={refCallback}
          inputValue={otpArray[index]}
          focusPrevious={focusPrevious}
          onOtpChange={onOtpChange}
        />
      ))}
    </View>
  );
}

const OtpInput = ({
  index,
  fontSize,
  controlWidth,
  controlHeight,
  backgroundColor,
  textInputRef,
  refCallback,
  inputValue,
  focusPrevious,
  onOtpChange,
}) => {
  return (
    <Neomorph
      key={index}
      style={{
        ...styles.neoMorph,
        width: controlWidth,
        height: controlHeight,
      }}>
      <Neomorph
        style={{
          ...styles.neoMorph2,
          width: controlWidth,
          height: controlHeight,
        }}>
        <View style={styles.inputWrap}>
          <TextInput
            style={[
              styles.textInput,
              AppStyles.text,
              {fontSize},
              inputValue ? styles.inputFilled(backgroundColor) : null,
            ]}
            underlineColorAndroid="transparent"
            keyboardType="phone-pad"
            autoFocus={index === 0 ? true : undefined}
            maxLength={1}
            value={inputValue}
            onKeyPress={(e) => focusPrevious(e.nativeEvent.key, index)}
            onChangeText={onOtpChange(index)}
            ref={refCallback(textInputRef)}
          />
        </View>
      </Neomorph>
    </Neomorph>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  neoMorph: {
    shadowRadius: 4,
    borderRadius: 10,
    backgroundColor: AppStyles.colors.white,
  },
  neoMorph2: {
    shadowRadius: 4,
    borderRadius: 10,
    backgroundColor: AppStyles.colors.btnShadow,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 10,
  },
  textInput: {
    flex: 1,
    padding: 0,
    borderRadius: 10,
    textAlign: 'center',
  },
  inputFilled: (backgroundColor) => ({
    backgroundColor: backgroundColor || AppStyles.colors.oliveGreen,
    color: 'white',
  }),
  otpText: {
    fontWeight: 'bold',
    color: 'blue',
    fontSize: 18,
    width: 30,
    borderWidth: 1,
    borderColor: 'red',
  },
});
