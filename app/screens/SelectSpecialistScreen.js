import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, FlatList} from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AppHeading from '../components/AppHeading';
import AppPara from '../components/AppPara';
import AppButtonBack from '../components/AppButtonBack';
import AppCardShadow from '../components/AppCardShadow';
import AppButtonPrimary from '../components/AppButtonPrimary';
import AppButtonSecondary from '../components/AppButtonSecondary';
import AppStyles, {Container_Width} from '../config/style';
import AppErrorMessage from '../components/AppErrorMessage';

import LoadingIndicator from '../components/LoadingIndicator';
import specialistsApi from '../api/specialists';

const WIDTH = Container_Width;

export default function SelectSpecialistScreen({navigation, route}) {
  const [Specialists, setSpecialists] = useState([]);
  const [selectedSpecIds, set_selectedSpecIds] = useState([]);
  const [return_payload, set_return_payload] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function resetStates() {
    setError('');
  }

  /* ===== Side Effects ===== */
  useEffect(() => {
    loadSpecialst();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetStates();
      let routeSpecialty, routeFilters;
      if (route?.params?.SpecialityIds) {
        routeSpecialty = route.params.SpecialityIds;
        set_selectedSpecIds(routeSpecialty);
      }
      if (route?.params?.FILTERS) {
        routeFilters = route.params.FILTERS;
        set_return_payload(routeFilters);
      }
      // configureBackButton(routeSpecialty, routeFilters);
    });
    return unsubscribe;
  }, [route]);

  function configureBackButton(speclty, filtrs) {
    const _specialists = Specialists.filter((item) =>
      speclty.includes(item._id),
    );
    navigation.setOptions({
      headerLeft: () => (
        <AppButtonBack
          style={{marginLeft: 35}}
          btPress={() => {
            navigation.navigate('FindDoctor', {
              fromSpecialist: true,
              specialistsArray: _specialists,
              FILTERS: filtrs,
            });
          }}
        />
      ),
    });
  }

  /* ===== Async calls ===== */
  const loadSpecialst = async () => {
    try {
      const resp = await specialistsApi.getAllSpecialist();
      if (resp?.ok) {
        if (resp?.data?.length) {
          const sorted = characterSort(resp.data, 'title');
          setSpecialists(sorted);
        }
      } else {
        setError(
          resp?.data?.errors?.[0]?.msg || 'Error in loading specialists',
        );
      }
    } catch (error) {
      console.error('Error in loading specialities', error);
      setError(error || 'Error in loading specialities');
    }
    setIsLoading(false);
  };

  /* ===== Functions ===== */
  function characterSort(inArr, _key) {
    const outArr = [...inArr].sort((a, b) => {
      let fa = a[_key].toLowerCase(),
        fb = b[_key].toLowerCase();
      return fa !== fb ? (fa < fb ? -1 : 1) : 0;
    });
    return outArr;
  }

  const selectSpecialists = (id) => {
    let specsArr = [...selectedSpecIds];
    const atIndex = specsArr.indexOf(id);
    atIndex === -1 ? specsArr.push(id) : specsArr.splice(atIndex, 1);
    set_selectedSpecIds(specsArr);
  };

  const findResults = () => {
    const _specialists = Specialists.filter((item) =>
      selectedSpecIds.includes(item._id),
    );
    navigation.navigate('FindDoctor', {
      fromSpecialist: true,
      specialistsArray: _specialists,
      FILTERS: return_payload,
    });
  };

  const resetSpecialists = () => set_selectedSpecIds([]);

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.flatlist_item}>
        <AppCardShadow
          c_id={item._id}
          c_title={item.title}
          c_subtitle={item.subtitle}
          c_thumbnail={item.thumbnail}
          c_thumbnail_active={item.thumbnail_active}
          is_Selected={selectedSpecIds.includes(item._id)}
          height={responsiveWidth(100) * 0.21}
          style={AppStyles.centerXY}
          action_function={selectSpecialists}
        />
      </View>
    );
  };

  const keyExtractor = (item, index) => 'sp-list-' + item._id;

  return (
    <View style={styles.mainContainer}>
      <LoadingIndicator visible={isLoading} />
      <View style={styles.content}>
        <View style={styles.header}>
          <AppHeading style={{textAlign: 'center'}}>
            Select Specialist
          </AppHeading>
        </View>

        <View style={styles.sub_header}>
          <AppPara style={styles.sub_title}>
            consult the best specialist near your area
          </AppPara>
        </View>

        {error !== '' && (
          <View>
            <AppErrorMessage showMsg={true} error={error} />
          </View>
        )}

        <View style={styles.section}>
          <FlatList
            data={Specialists}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            initialNumToRender={4}
          />
        </View>

        <View style={styles.footer}>
          <AppButtonPrimary
            btTitle={'FIND RESULTS'}
            width={responsiveWidth(100) * 0.55}
            aspect_ratio={0.22}
            shadowRadius={3}
            borderRadius={6}
            style={{alignSelf: 'center', marginBottom: 20}}
            btPress={findResults}
          />
          <AppButtonSecondary
            btTitle={'RESET ALL'}
            width={responsiveWidth(100) * 0.3}
            aspect_ratio={0.22}
            shadowRadius={3}
            borderRadius={6}
            style={{alignSelf: 'center'}}
            btPress={resetSpecialists}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  content: {
    flex: 1,
    width: WIDTH,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: -12,
  },
  sub_header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sub_title: {
    width: '86%',
    fontSize: responsiveFontSize(2.0),
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    flex: 1,
    marginBottom: 25,
    alignSelf: 'center',
    width: WIDTH + 20,
  },
  flatlist_item: {marginVertical: 10, alignSelf: 'center'},
  footer: {
    flexShrink: 1,
    marginTop: 'auto',
  },
});
