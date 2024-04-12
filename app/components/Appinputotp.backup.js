import React, { useRef, useState, useEffect } from 'react';
import {StyleSheet, View, Text, TextInput, Platform} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import defaultStyles from '../config/style';

import RNOtpVerify from 'react-native-otp-verify';

export default function AppInputOtp({
  wrapperWidth = '100%',
  controlWidth = 60,
  controlHeight = 70,
  // backgroundColor = defaultStyles.colors.oliveGreen,
  fontSize = 18,
  value
}) {

  let refs = useRef([React.createRef(), React.createRef()]);

  // useEffect(() => {
  //   refs.current[0].current.focus()
  // }, []);

  const firstTextInputRef = useRef(null);
  const secondTextInputRef = useRef(null);
  const thirdTextInputRef = useRef(null);
  const fourthTextInputRef = useRef(null); 
  const fifthTextInputRef = useRef(null);
  const sixthTextInputRef = useRef(null);

  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [submittingOtp, setSubmittingOtp] = useState(false);

  // const [autoSubmitOtpTime, setAutoSubmitOtpTime] = useState(
  //   AUTO_SUBMIT_OTP_TIME_LIMIT,
  // );

  const [bgColor, setBgColor] = useState(false);

  useEffect(() => {
    // docs: https://github.com/faizalshap/react-native-otp-verify

    RNOtpVerify.getOtp()
      .then(p =>
        RNOtpVerify.addListener(message => {
          try {
            if (message) {
              const messageArray = message.split('\n');
              if (messageArray[2]) {
                const otp = messageArray[2].split(' ')[0];
                if (otp.length === 6) {
                  setOtpArray(otp.split(''));

                  // to auto submit otp in 4 secs
                  // setAutoSubmitOtpTime(AUTO_SUBMIT_OTP_TIME_LIMIT);
                  // startAutoSubmitOtpTimer();
                }
              }
            }
          } catch (error) {
            console.log('Error autoread', error)
          }
        }),
      )
      .catch(error => {
        console.log('Error otp', error)
      });

    // remove listener on unmount
    return () => {
      RNOtpVerify.removeListener();
    };
  }, []);


  const refCallback = textInputRef => node => {
    console.log('refCallback.textInputRef', textInputRef);
    console.log('refCallback.node', node);
    textInputRef.current = node;
  };

  const setTextBoxColor = (text) => {
    if(text.length === 1){
      console.log('true')
      setBgColor(true);
    } else {
      setBgColor(false);
    }
  }  

  console.log(value);

  if(value) setOtpArray(value.split(''));

  const onOtpChange = index => {
    return value => {
      if (isNaN(Number(value))) {
        // do nothing when a non digit is pressed
        return;
      }
      const otpArrayCopy = otpArray.concat();
      otpArrayCopy[index] = value;
      setOtpArray(otpArrayCopy);
      setTextBoxColor(value);

      console.log('sixthTextInputRef', sixthTextInputRef);

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

  const onOtpKeyPress = index => {
    return ({nativeEvent: {key: value}}) => {
      // auto focus to previous InputText if value is blank and existing value is also blank
      if (value === 'Backspace' && otpArray[index] === '') {
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
        }
      }
    };
  };

  



  return (
    <View style={[styles.inputWrapper, {width: wrapperWidth}]}>
      {[
        firstTextInputRef,
        secondTextInputRef,
        thirdTextInputRef,
        fourthTextInputRef,
        fifthTextInputRef,
        sixthTextInputRef
      ].map((textInputRef, index) => (

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
                    defaultStyles.text,
                    bgColor ? styles.backgroundColor : null,
                    { fontSize }
                  ]}
                  // placeholder={placeholder}
                  // 1placeholderTextColor={defaultStyles.colors.white}
                  underlineColorAndroid="transparent"
                  keyboardType='phone-pad'
                  autoFocus={index === 0 ? true : undefined}
                  maxLength={1}
                  value={otpArray[index]}
                  // onChangeText={ (text) => setTextBoxColor(text)}
                  onKeyPress={onOtpKeyPress(index)}
                  onChangeText={onOtpChange(index)}
                  refCallback={refCallback(textInputRef)}
                  key={index}
                />
              </View>
            </Neomorph>
          </Neomorph>
      ))}
      {/* <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        // placeholder={'5'}
      />
      <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        //placeholder={'2'}
      />
      <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        //placeholder={'7'}
      />
      <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        //placeholder={'5'}
      />
      <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        //placeholder={'5'}
      />
      <OtpInput
        fontSize={fontSize}
        controlWidth={controlWidth}
        controlHeight={controlHeight}
        // backgroundColor={backgroundColor}
        //placeholder={'5'}
      /> */}
    </View>
  );
}

const OtpInput = ({
  fontSize,
  controlWidth,
  controlHeight,
  backgroundColor,
  placeholder,
  onKeyPress,
  onChangeText,
  key
}) => {

  const [bgColor, setBgColor] = useState(false);

  const setTextBoxColor = (text) => {
    if(text.length === 1){
      console.log('true')
      setBgColor(true);
    } else {
      setBgColor(false);
    }
  }  

  

  return (
    <Neomorph
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
              defaultStyles.text,
              bgColor ? styles.backgroundColor : null,
              { fontSize }
            ]}
            placeholder={placeholder}
            placeholderTextColor={defaultStyles.colors.white}
            underlineColorAndroid="transparent"
            keyboardType='phone-pad'
            autoFocus
            maxLength={1}
            // onChangeText={ (text) => setTextBoxColor(text)}
            onKeyPress={onKeyPress}
            onChangeText={onChangeText}
            // onChangeText={onOtpChange(index)}
            // refCallback={refCallback(textInputRef)}
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
    backgroundColor: defaultStyles.colors.white,
  },
  neoMorph2: {
    shadowRadius: 4,
    borderRadius: 10,
    backgroundColor: defaultStyles.colors.btnShadow,
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
  backgroundColor : {
    backgroundColor: defaultStyles.colors.oliveGreen,
    color: 'white'
  },
  otpText: {
    fontWeight: 'bold',
    color: 'blue',
    fontSize: 18,
    width: 30,
    borderWidth: 1,
    borderColor: 'red'
  }
});
