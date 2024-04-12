import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ToComePopup} from '../utility/alert-boxes';

export default function ToComeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text>Coming Soon</Text>
      {ToComePopup()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
