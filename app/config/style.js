import {Platform, Dimensions} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import colors from './colors';

export const IsAndroid = Platform.OS === 'android' ? true : false;

export const Container_Width = responsiveWidth(82.5);

export const Input_Aspect_Ratio = 0.22;

const DefaultStyles = {
  colors,
  text: {
    color: colors.darkgrey,
    fontSize: 18,
    fontFamily: IsAndroid ? 'Roboto' : 'Avenir',
  },
  inspectBorder: {borderWidth: 1, borderColor: 'red'},
  centerXY: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowWidth: Dimensions.get('window').width,
  windowHeight: Dimensions.get('window').height,
};
export default DefaultStyles;

export const GetTextStyle = (
  color = colors.darkgrey,
  fontSize = 1.6,
  fontWeight = 'normal',
  textAlign = 'left',
) => ({
  fontSize: responsiveFontSize(fontSize),
  color,
  fontWeight,
  textAlign,
});
