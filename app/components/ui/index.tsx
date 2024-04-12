import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, TextInput, Text} from 'react-native';

export const AgoraView = (props) => {
  return (
    <>
      <View {...props} />
    </>
  );
};

export const AgoraText = (props) => {
  return (
    <>
      <Text {...props} />
    </>
  );
};

export const AgoraButton = (props) => {
  return (
    <>
      <Button {...props} />
    </>
  );
};

export const AgoraDivider = (props) => {
  return (
    <>
      <View>------</View>
      {/* <Divider width={1} color={'grey'} {...props} /> */}
    </>
  );
};

export const AgoraTextInput = (props) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const { style, ref, ...others } = props;
  return (
    <>
      <TextInput
        containerStyle={[AgoraStyle.input, style]}
        placeholderTextColor={'gray'}
        {...others}
        onChangeText={(text) => {
          setValue(text);
          props.onChangeText?.call(this, text);
        }}
        value={value}
      />
    </>
  );
};

// export const AgoraSlider = (props & { title: string }) => {
//   const [value, setValue] = useState(props.value);

//   useEffect(() => {
//     setValue(props.value);
//   }, [props.value]);

//   const { title, ...others } = props;
//   return (
//     <>
//       <AgoraText children={title} />
//       <Slider
//         style={AgoraStyle.slider}
//         minimumTrackTintColor={'white'}
//         thumbStyle={AgoraStyle.thumb}
//         {...others}
//         value={value}
//         onValueChange={(v) => {
//           setValue(v);
//           props.onValueChange?.call(this, v);
//         }}
//       />
//     </>
//   );
// };

// export const AgoraSwitch = (props & { title: string }) => {
//   const [value, setValue] = useState(props.value);

//   useEffect(() => {
//     setValue(props.value);
//   }, [props.value]);

//   const { title, ...others } = props;
//   return (
//     <>
//       <AgoraText children={title} />
//       <Switch
//         {...others}
//         value={value}
//         onValueChange={(v) => {
//           setValue(v);
//           props.onValueChange?.call(this, v);
//         }}
//       />
//     </>
//   );
// };

// export const AgoraImage = (props) => {
//   return (
//     <>
//       <Image {...props} />
//     </>
//   );
// };


export const AgoraStyle = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  fullSize: {
    flex: 1,
  },
  input: {
    height: 50,
    color: 'black',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  videoLarge: {
    flex: 1,
  },
  videoSmall: {
    width: 120,
    height: 120,
  },
  float: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    height: 20,
    width: 20,
    backgroundColor: 'grey',
  },
});