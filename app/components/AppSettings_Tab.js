import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import AppPanelBordered from './AppPanelBordered';
import AppPanelBasic from './AppPanelBasic';
import AppBoxShadow from './AppBoxShadow';
import AppStyles, {GetTextStyle, Container_Width} from '../config/style';
import {makeWebViewSource} from '../config/functions';
import {ToComePopup} from '../utility/alert-boxes';

const WIDTH = Container_Width;
const ICON_PLUS = require('../assets/images/icon_plus_2.png');
const ICON_MINUS = require('../assets/images/minus_trans.png');

export default function AppSettings_Tab({tabData = {}, navigation}) {
  return (
    <View style={styles.tab_wrapper}>
      <ScrollView contentContainerStyle={styles.scroll_view}>
        <View style={styles.tab_content}>
          {/* {tabData?.APP_VERSION ? (
            <AppVersionBox
              avData={tabData.APP_VERSION}
              navigation={navigation}
            />
          ) : null}
          <AppPanelBasic
            backgroundColor={'#96D9CF'}
            color={'#555555'}
            borderColor={'#FCE8D3'}
            image={require('../assets/images/phone_held.png')}
            caption={'Expert Recommendation'}
            title={'Self Diagnosis'}
            para={'We help you with tips and tricks'}
            para_color={'#8B5602'}
            isButton={true}
            action_title={'SHARE NOW'}
            action_color={'#69BCB0'}
            action_function={ToComePopup}
            style={{marginBottom: 35}}
          /> */}
          <PrivacyPolicy ppData={tabData.PRIVACY_POLICY} />
        </View>
      </ScrollView>
    </View>
  );
}

const AppVersionBox = ({avData = {}, navigation}) => (
  <AppPanelBordered
    backgroundColor={'#E6F0F6'}
    borderColor={'#D6EAF6'}
    style={{marginBottom: 30}}
    pnl_title={
      <Text style={[GetTextStyle('#003375', 1.9, 'bold'), {marginBottom: 13}]}>
        {avData.title}
      </Text>
    }
    pnl_image={avData.image}
    pnl_text={
      <Text style={GetTextStyle(undefined, 1.5)}>{avData.content}</Text>
    }
    button_config={{
      btTitle: avData.button_title,
      gradientBorderColor: '#ECF1F5',
      btPress: ToComePopup,
    }}
  />
);

const PrivacyPolicy = ({ppData}) => {
  const contentWidth = useWindowDimensions().width;
  const [collapsed, set_collapsed] = useState(false);
  const text_color = collapsed ? '#A0A0A0' : '#407ED0';
  return (
    <View style={styles.section_wrapper}>
      {ppData?.title ? (
        <Text style={[GetTextStyle(undefined, 1.8, 'bold'), {marginBottom: 7}]}>
          {ppData.title}
        </Text>
      ) : null}
      {ppData?.paragraph ? (
        <View style={styles.section_content}>
          <AutoHeightWebView
            originWhitelist={['*']}
            source={makeWebViewSource(ppData.paragraph)}
            style={styles.webview_content}
            customStyle={`* {font-size: 14px;}`}
          />
        </View>
      ) : (
        <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
          No Content
        </Text>
      )}
      {/* {ppData?.paragraph_more ? (
        <Collapse
          style={styles.section_wrapper}
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
            <View>
              <HTML
                source={{html: ppData.paragraph_more}}
                contentWidth={contentWidth}
              />
            </View>
          </CollapseBody>
        </Collapse>
      ) : null} */}
    </View>
  );
};

const styles = StyleSheet.create({
  tab_wrapper: {
    width: responsiveWidth(100),
    alignSelf: 'center',
    marginTop: 7,
  },
  scroll_view: {
    width: responsiveWidth(100),
    alignItems: 'center',
  },
  tab_content: {
    width: WIDTH,
  },
  section_wrapper: {},
  section_content: {
    width: responsiveWidth(100),
    alignSelf: 'center',
    alignItems: 'center',
  },
  webview_content: {
    width: WIDTH,
    backgroundColor: AppStyles.colors.lightgrey,
  },
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
