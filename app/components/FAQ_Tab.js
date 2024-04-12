import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  useWindowDimensions,
  LogBox,
} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import AppBoxShadow from './AppBoxShadow';
import AppBoxShadowInner from './AppBoxShadowInner';
import AppStyles, {GetTextStyle, Container_Width} from '../config/style';
import HTML from 'react-native-render-html';

const WIDTH = Container_Width;
const ICON_PLUS = require('../assets/images/icon_plus_2.png');
const ICON_MINUS = require('../assets/images/minus_trans.png');

export default function FAQ_Tab({tabData, navigation}) {
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  return (
    <FlatList
      data={tabData}
      renderItem={({item, index}) => <RenderPanel item={item} index={index} />}
      keyExtractor={PanelKeyExtractor}
      style={styles.flat_list}
      ListEmptyComponent={
        <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
          No Data
        </Text>
      }
    />
  );
}

function RenderPanel({item, index}) {
  const contentWidth = useWindowDimensions().width;
  const [collapsed, set_collapsed] = useState(false);
  return (
    <Collapse
      style={styles.section_wrapper}
      isCollapsed={collapsed}
      onToggle={(isCollapsed) => set_collapsed(isCollapsed)}>
      <CollapseHeader style={styles.collapse_head}>
        <Text style={styles.clp_head_text}>{item.question}</Text>
        <CollapseTrigger isCollapsed={collapsed} />
      </CollapseHeader>
      <CollapseBody>
        <View>
          <HTML source={{html: item?.answer}} contentWidth={contentWidth} />
        </View>
      </CollapseBody>
    </Collapse>
  );
}

const PanelKeyExtractor = (item, index) => 'panel-' + index;

const CollapseTrigger = ({isCollapsed}) => {
  return (
    <View style={styles.trigger_wrap}>
      <AppBoxShadowInner
        width={24}
        height={24}
        borderRadius={30}
        shadowRadius={2}
        content_style={AppStyles.centerXY}>
        <AppBoxShadow
          width={14}
          height={14}
          borderRadius={30}
          shadowRadius={1}
          content_style={AppStyles.centerXY}>
          <View style={styles.icon_wrap(isCollapsed ? '#A0A0A0' : '#407ED0')}>
            <Image
              style={{
                width: '55%',
                resizeMode: 'contain',
              }}
              source={isCollapsed ? ICON_MINUS : ICON_PLUS}
            />
          </View>
        </AppBoxShadow>
      </AppBoxShadowInner>
    </View>
  );
};

const styles = StyleSheet.create({
  flat_list: {
    width: responsiveWidth(100),
    alignSelf: 'center',
  },
  section_wrapper: {width: WIDTH, alignSelf: 'center', marginBottom: 20},
  collapse_head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clp_head_text: {
    flex: 1,
    ...GetTextStyle(undefined, 1.8, 'bold'),
    lineHeight: 18,
  },
  trigger_wrap: {flexBasis: 30},
  icon_wrap: (bgColor) => ({
    ...AppStyles.centerXY,
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
    borderRadius: 30,
  }),
});
