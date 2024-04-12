import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppCardShadowPlus from './AppCardShadowPlus';
import AppStyles, {GetTextStyle} from '../config/style';

export default function Document_Tab({tabData, patientDoctors, navigation}) {
  const navigateToDetails = (item) =>
    navigation.navigate('DocumentList', {
      DOCUMENTS: item,
      DOCTORS: patientDoctors,
    });

  return (
    <View style={styles.flat_list}>
      <FlatList
        data={tabData}
        renderItem={RenderCard(tabData.length, navigateToDetails)}
        keyExtractor={CardKeyExtractor}
      />
    </View>
  );
}

const RenderCard = (totalItems, navigateToDetails) => ({item, index}) => {
  let last_item = index + 1 === totalItems ? {marginBottom: 40} : {};
  return (
    <View
      style={{
        width: responsiveWidth(100),
        alignItems: 'center',
        paddingVertical: 7,
        ...last_item,
      }}>
      <AppCardShadowPlus
        cardPressed={() => navigateToDetails(item)}
        c_thumb={item.thumb}
        txt_section={
          <>
            <Text style={GetTextStyle('#3D7BCF', 2, 'bold')}>
              {item.title} ({item.count})
            </Text>
            <Text style={[GetTextStyle('#888888', 1.85)]}>{item.text}</Text>
          </>
        }
      />
    </View>
  );
};

const CardKeyExtractor = (item, index) => 'card--' + index;

const styles = StyleSheet.create({
  flat_list: {
    width: responsiveWidth(100),
    alignItems: 'center',
    alignSelf: 'center',
  },
});
