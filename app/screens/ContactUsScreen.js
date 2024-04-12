import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import HTML from 'react-native-render-html';
import AutoHeightImage from 'react-native-auto-height-image';
import contactUsApi from '../api/contactUs';
import AppErrorMessage from '../components/AppErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import AppStyles, {
  GetTextStyle,
  IsAndroid,
  Container_Width,
} from '../config/style';

const WIDTH = Container_Width;

export default function ContactUsScreen({navigation}) {
  const [contactUsData, set_contactUsData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }

  useEffect(() => {
    resetStates();
    loadDetails();
  }, []);

  /* ===== Async API calls ===== */
  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const resp = await contactUsApi.getContactUs();
      if (resp?.ok) {
        if (resp?.data?.length) set_contactUsData(resp.data[0]);
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error Loading the Contact Us',
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetching About', error);
      setError(error);
    }
  };

  const contentWidth = useWindowDimensions().width;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.app_logo}>
        <AutoHeightImage
          width={responsiveWidth(100) * 0.16}
          source={require('../assets/logo.png')}
        />
      </View>
      <View style={styles.content}>
        <LoadingIndicator visible={isLoading} />
        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}
        {contactUsData?.title ? (
          <Text style={styles.heading}>{contactUsData.title}</Text>
        ) : null}

        <ScrollView style={styles.scroll_style}>
          {contactUsData?.paragraph ? (
            <HTML
              source={{html: contactUsData.paragraph}}
              contentWidth={contentWidth}
            />
          ) : (
            <Text style={GetTextStyle(undefined, 2, 'bold', 'center')}>
              No Content
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  app_logo: {
    marginBottom: 0,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    marginTop: IsAndroid ? 30 : 80,
    marginBottom: IsAndroid ? 0 : 80,
  },
  heading: {
    ...GetTextStyle(undefined, 2.6, 'bold'),
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll_style: {
    width: responsiveWidth(100),
    paddingHorizontal: (responsiveWidth(100) - WIDTH) / 2,
  },
});
