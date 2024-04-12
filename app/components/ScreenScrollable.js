import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {StatusBar} from 'react-native';
import AppStyles from '../config/style';

export default function ScreenScrollable({
  children,
  style,
  passOffsetY,
  ...scroll_props
}) {
  return (
    <SafeAreaView style={[styles.screen]}>
      <ScrollView
        contentContainerStyle={[styles.scrollView, style]}
        {...scroll_props}
        onScroll={(event) => {
          passOffsetY?.(event.nativeEvent.contentOffset.y);
        }}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    // paddingTop: StatusBar.currentHeight,
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
});
