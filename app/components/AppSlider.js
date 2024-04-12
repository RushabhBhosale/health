import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppCard from './AppCard';
import SwiperFlatList from 'react-native-swiper-flatlist';
import defaultStyles, {IsAndroid} from '../config/style';

export const {width, height} = Dimensions.get('window');

export default function AppSlider({slides, currentSlide}) {
  return (
    <>
      <View style={styles.container}>
        <SwiperFlatList
          autoplay={false}
          autoplayDelay={10}
          autoplayLoop={true}
          index={currentSlide}
          showPagination
          paginationDefaultColor="#ffffff"
          paginationActiveColor={defaultStyles.colors.oliveGreen}
          PaginationComponent={PaginationComp}
          // paginationStyle={styles.dot}
          // paginationStyleItem={styles.item}
        >
          {slides.map((slide, i) => (
            <AppCard key={'slide-' + i} data={slide} />
          ))}
        </SwiperFlatList>
      </View>
    </>
  );
}

const PaginationComp = ({
  size,
  paginationIndex,
  scrollToIndex,
  paginationDefaultColor,
  paginationActiveColor,
}) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({length: size}).map((_, index) => {
        return (
          <TouchableOpacity key={index} onPress={() => scrollToIndex({index})}>
            <Neomorph inner={IsAndroid} style={styles.pagination}>
              {paginationIndex === index ? (
                <Neomorph
                  style={{
                    ...styles.paginationInner,
                    backgroundColor: paginationActiveColor,
                  }}
                />
              ) : (
                <Text></Text>
              )}
            </Neomorph>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: '5%',
    left: width * 0.25,
    right: width * 0.25,
  },
  pagination: {
    shadowRadius: 2,
    borderRadius: 25,
    backgroundColor: defaultStyles.colors.lightgrey,
    width: responsiveWidth(6), //width * 0.0375,
    height: responsiveWidth(6), //width * 0.0375,
    marginHorizontal: responsiveWidth(2), //width * 0.025,
    ...defaultStyles.centerXY,
  },
  paginationInner: {
    shadowRadius: 1,
    borderRadius: 25,
    width: responsiveWidth(3.5),
    height: responsiveWidth(3.5),
  },
});
