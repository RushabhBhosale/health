import React, {useState} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import {DividerX} from './AppCommonComponents';
import AppBoxShadow from './AppBoxShadow';
import AppStyles, {GetTextStyle, Container_Width} from '../config/style';
import HTML from 'react-native-render-html';

const WIDTH = Container_Width;
const ICON_PLUS = require('../assets/images/icon_plus_2.png');
const ICON_MINUS = require('../assets/images/minus_trans.png');

export default function About_Tab({aboutus, vision, navigation}) {
  return <RenderPanel item={aboutus} vision={vision} />;
}

const RenderPanel = ({item, vision}) => {
  const [collapsed, set_collapsed] = useState(false);
  const text_color = collapsed ? '#A0A0A0' : '#407ED0';

  return (
    <View style={styles.content_wrapper}>
      <View style={styles.section_wrapper}>
        {item?.title ? (
          <Text
            style={[GetTextStyle(undefined, 1.8, 'bold'), {marginBottom: 7}]}>
            {item.title}
          </Text>
        ) : null}
        {item?.shortDescription ? (
          <View>
            <HTML source={{html: item.shortDescription}} />
          </View>
        ) : (
          <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
            No Content
          </Text>
        )}
        {item?.paragraph ? (
          <Collapse
            style={styles.collapse_wrapper}
            isCollapsed={collapsed}
            onToggle={(isCollapsed) => set_collapsed(isCollapsed)}>
            <CollapseHeader>
              <AppBoxShadow
                width={responsiveWidth(100) * 0.23}
                height={22}
                borderRadius={4}
                style={{marginBottom: 0}}>
                <View style={styles.section_btn}>
                  <Text style={styles.btn_text(text_color)}>
                    VIEW {collapsed ? 'LESS' : 'MORE'}
                  </Text>
                  <View style={styles.icon_wrap(text_color)}>
                    <Image
                      style={{
                        width: '55%',
                        resizeMode: 'contain',
                      }}
                      source={collapsed ? ICON_MINUS : ICON_PLUS}
                    />
                  </View>
                </View>
              </AppBoxShadow>
            </CollapseHeader>
            <CollapseBody>
              <HTML source={{html: item.paragraph}} />
            </CollapseBody>
          </Collapse>
        ) : null}
        <DividerX style={{marginTop: 25, marginBottom: 20}} />
        {vision?.title ? (
          <Text
            style={[GetTextStyle(undefined, 1.8, 'bold'), {marginBottom: 7}]}>
            {vision.title}
          </Text>
        ) : null}
        {vision?.shortDescription ? (
          <View>
            <HTML source={{html: vision.shortDescription}} />
          </View>
        ) : (
          <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
            No Content
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content_wrapper: {},
  section_wrapper: {width: WIDTH, alignSelf: 'center'},
  collapse_wrapper: {width: WIDTH, alignSelf: 'center'},
  section_btn: {
    flex: 1,
    flexDirection: 'row',
    ...AppStyles.centerXY,
  },
  btn_text: (color) => ({
    ...GetTextStyle(color, 1.5),
    marginRight: 4,
  }),
  icon_wrap: (bgColor) => ({
    ...AppStyles.centerXY,
    width: 13,
    height: 13,
    backgroundColor: bgColor,
    borderRadius: 30,
  }),
});
