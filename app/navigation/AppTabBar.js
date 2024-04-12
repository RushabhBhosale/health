import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import {NeomorphFlex} from 'react-native-neomorph-shadows';
import AppBoxShadow from '../components/AppBoxShadow';
import AppStyles from '../config/style';

export default function AppTabBar({state, descriptors, navigation}) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <AppBoxShadow
      width={responsiveWidth(100)}
      height={responsiveWidth(100) * 0.2}
      borderRadius={0}
      shadowRadius={2}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return options.is_search ? (
            <SearchButton
              key={route.key}
              icon_img={options.icon_img}
              onPress={onPress}
            />
          ) : isFocused ? (
            <TabButtonActive key={route.key} icon_img={options.icon_img} />
          ) : (
            <TabButton
              key={route.key}
              icon_img={options.icon_img}
              btPress={onPress}
            />
          );
        })}
      </View>
    </AppBoxShadow>
  );
}

const SearchButton = ({icon_img, ...rest_props}) => (
  <AppBoxShadow
    width={responsiveWidth(100) * 0.18}
    height={responsiveWidth(100) * 0.18}
    borderRadius={50}
    shadowRadius={2}
    style={{marginTop: -(responsiveWidth(100) * 0.2)}}
    content_style={AppStyles.centerXY}>
    <View style={styles.search_wrap}>
      <TouchableHighlight
        underlayColor={'#D4F6C0'}
        {...rest_props}
        style={styles.search_touch}>
        <View style={styles.search_button}>
          <Image style={styles.search_image} source={icon_img} />
        </View>
      </TouchableHighlight>
    </View>
  </AppBoxShadow>
);

const TabButton = ({icon_img, btPress}) => (
  <TouchableOpacity
    underlayColor={'#EFF3F5'}
    style={styles.touch_highlight}
    onPress={btPress}>
    <NeomorphFlex
      style={{
        ...styles.neoflex,
        backgroundColor: AppStyles.colors.white,
      }}>
      <NeomorphFlex
        style={{
          ...styles.neoflex,
          backgroundColor: AppStyles.colors.btnShadow,
        }}>
        <View style={styles.btn_inner}>
          <Image style={styles.btn_img} source={icon_img} />
        </View>
      </NeomorphFlex>
    </NeomorphFlex>
  </TouchableOpacity>
);

const TabButtonActive = ({icon_img}) => (
  <View style={styles.btn_active}>
    <Image style={styles.btn_img} source={icon_img} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    flexBasis: '100%',
    backgroundColor: AppStyles.colors.lightgrey,
    paddingHorizontal: 15,
  },
  search_wrap: {
    ...AppStyles.centerXY,
    width: '100%',
    height: '100%',
    backgroundColor: AppStyles.colors.oliveGreen,
    borderColor: '#EEF3F5',
    borderWidth: 2,
    borderRadius: 50,
  },
  search_touch: {
    width: '100%',
    borderRadius: 50,
    ...AppStyles.centerXY,
  },
  search_button: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    padding: 15,
  },
  search_image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  neoflex: {
    width: responsiveWidth(100) * 0.12,
    height: responsiveWidth(100) * 0.12,
    borderRadius: 7,
    shadowRadius: 3,
    shadowOffset: {width: 2, height: 2},
    ...AppStyles.centerXY,
  },
  touch_highlight: {
    borderRadius: 7,
  },
  btn_inner: {
    width: '100%',
    height: '100%',
    backgroundColor: AppStyles.colors.lightgrey,
    borderRadius: 7,
    ...AppStyles.centerXY,
  },
  btn_img: {width: '43%', resizeMode: 'contain'},
  btn_active: {
    width: responsiveWidth(100) * 0.12,
    height: responsiveWidth(100) * 0.12,
    borderRadius: 7,
    backgroundColor: '#CEDEFF',
    ...AppStyles.centerXY,
  },
});
