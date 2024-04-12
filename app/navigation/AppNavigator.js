import React, {useState} from 'react';
import {View, Image, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import PathologyDetailScreen from '../screens/PathologyDetailScreen';
import PrescriptionDetailScreen from '../screens/PrescriptionDetailScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import AppointmentFeedbackScreen from '../screens/AppointmentFeedbackScreen';
import FindDoctorsScreen from '../screens/FindDoctorsScreen';
import DoctorProfileScreen from '../screens/DoctorProfileScreen';
import SelectSpecialistScreen from '../screens/SelectSpecialistScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import PersonalDetailScreen from '../screens/PersonalDetailScreen';
import Notifications from '../screens/Notifications';
import SidemenuScreen from '../screens/SidemenuScreen';
import AppointmentConfirmedScreen from '../screens/AppointmentConfirmedScreen';
import DocumentListScreen from '../screens/DocumentListScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import AddMedInsuranceScreen from '../screens/AddMedInsuranceScreen';
import AddFamilyMemberScreen from '../screens/AddFamilyMemberScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import BookTestScreen from '../screens/BookTestScreen';
import BookTestPaymentScreen from '../screens/BookTestPaymentScreen';
import BookTestSuccessScreen from '../screens/BookTestSuccessScreen';
import AppButtonIcon from '../components/AppButtonIcon';
import AppStyles from '../config/style';
import {responsiveWidth} from 'react-native-responsive-dimensions';
import AppButtonBack from '../components/AppButtonBack';
import ToComeScreen from '../screens/ToComeScreen';
import AppTabBar from './AppTabBar';
import FMCScreen from '../screens/FMC_Screen';
import AppButtonBasic from '../components/AppButtonBasic';

const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
const AppointmentStack = createStackNavigator();
const DoctorStack = createStackNavigator();
const AssessmentStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const Tab = createBottomTabNavigator();

import i18n from '../../languages/i18next';
import WellnessVideos from '../screens/WellnessVideos';
import InsuranceFormScreen from '../screens/InsuranceForm';

let CheckUnreadNote = void 0;

const AppStackScreen = ({initialRoute, screenProps, hasUnreadNote}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={({navigation}) => ({
        title: '',
        headerShown: false,
        headerTransparent: true,
        headerLeft: () => (
          <AppButtonBack
            style={{
              marginLeft: responsiveWidth(8),
              marginTop: responsiveWidth(8),
            }}
            btPress={() => navigation.goBack(null)}
          />
        ),
      })}>
      <Stack.Screen
        name="EditPersonalDetails"
        component={PersonalDetailScreen}
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Drawer"
        component={SidemenuScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Dashboard"
        children={() => <TabsScreen hasUnreadNote={hasUnreadNote} />}
      />

      <Stack.Screen
        name="FindDoctor"
        options={({navigation}) => ({
          headerShown: true,
          headerTransparent: true,
        })}
        component={FindDoctorsScreen}
      />

      <Stack.Screen
        name="Doctor"
        options={({navigation}) => ({
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: BackButton(navigation),
          headerRight: NotificationButton(navigation, hasUnreadNote),
        })}
        component={DoctorProfileScreen}
        listeners={{
          focus: (e) => CheckUnreadNote(),
        }}
      />

      <Stack.Screen
        name="Specialist"
        options={({navigation}) => ({
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: BackButton(navigation),
          headerRight: NotificationButton(navigation, hasUnreadNote),
        })}
        component={SelectSpecialistScreen}
        listeners={{
          focus: (e) => CheckUnreadNote(),
        }}
      />

      <Stack.Screen
        name="AppointmentConfirmation"
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
        component={AppointmentConfirmedScreen}
      />

      <Stack.Screen
        name="Appointment"
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
        children={() => <TabsScreen hasUnreadNote={hasUnreadNote} />}
      />

      <Stack.Screen
        name="AppointmentDetail"
        options={({navigation}) => ({
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: BackButton(navigation),
          headerRight: NotificationButton(navigation, hasUnreadNote),
        })}
        component={AppointmentDetailScreen}
        listeners={{
          focus: (e) => CheckUnreadNote(),
        }}
      />

      <Stack.Screen
        name="PathologyDetail"
        options={({navigation}) => ({
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: BackButton(navigation),
          headerRight: NotificationButton(navigation, hasUnreadNote),
        })}
        component={PathologyDetailScreen}
        listeners={{
          focus: (e) => CheckUnreadNote(),
        }}
      />

      <Stack.Screen
        name="AppointmentFeedback"
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
        component={AppointmentFeedbackScreen}
      />

      <Stack.Screen
        name="PrescriptionDetail"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={PrescriptionDetailScreen}
      />

      <Stack.Screen
        name="InvoiceDetail"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={InvoiceDetailScreen}
      />

      <Stack.Screen
        name="DocumentList"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={DocumentListScreen}
      />

      <Stack.Screen
        name="DocumentUpload"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={DocumentUploadScreen}
      />

      <Stack.Screen
        name="AddMedInsurance"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={AddMedInsuranceScreen}
      />

      <Stack.Screen
        name="AddFamilyMember"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={AddFamilyMemberScreen}
      />

      <Stack.Screen
        name="Find_FMCs"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={FMCScreen}
      />
      <Stack.Screen
        name="insurance_form"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={InsuranceFormScreen}
      />
      <Stack.Screen
        name="Wellness_Videos"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={WellnessVideos}
      />
      <Stack.Screen
        name="About"
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
        component={AboutScreen}
      />
      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="VideoCall"
        children={(props) => <VideoCallScreen {...props} notification={screenProps} />}
      />

      {/* <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
        notification={screenProps}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />   */}

      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          tabBarVisible: true,
        }}
      />

      <Stack.Screen
        name="BookTest"
        options={({navigation}) => ({
          headerShown: true,
          headerTransparent: true,
        })}
        component={BookTestScreen}
      />

      <Stack.Screen
        name="BookTestPayment"
        options={({navigation}) => ({
          headerShown: true,
          headerTransparent: true,
        })}
        component={BookTestPaymentScreen}
      />

      <Stack.Screen
        name="BookTestSuccess"
        options={({navigation}) => ({
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => null,
          headerRight: CloseButton(() => navigation.navigate('Dashboard')),
        })}
        component={BookTestSuccessScreen}
      />
    </Stack.Navigator>
  );
};

const HomeStackScreen = ({hasUnreadNote}) => (
  <HomeStack.Navigator
    headerMode="float"
    screenOptions={({navigation}) => ({
      title: '',
      headerShown: true,
      headerTransparent: true,
      headerLeft: DrawerButton(navigation),
      headerRight: NotificationButton(navigation, hasUnreadNote)
    })}>
    <HomeStack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: '',
        headerShown: true,
        headerTransparent: true,
      }}
      listeners={{
        focus: (e) => CheckUnreadNote(),
      }}
    />
  </HomeStack.Navigator>
);

const AppointmentStackScreen = ({hasUnreadNote}) => (
  <AppointmentStack.Navigator
    initialRouteName="Appointment"
    screenOptions={({navigation}) => ({
      title: '',
      headerShown: true,
      headerTransparent: true,
      headerLeft: DrawerButton(navigation),
      headerRight: NotificationButton(navigation, hasUnreadNote),
    })}>
    <AppointmentStack.Screen
      name="Appointment"
      component={AppointmentScreen}
      listeners={{
        focus: (e) => CheckUnreadNote(),
      }}
    />
  </AppointmentStack.Navigator>
);

const VideosStackScreen = ({hasUnreadNote}) => (
  <AppointmentStack.Navigator
    initialRouteName="Health Education"
    screenOptions={({navigation}) => ({
      title: '',
      headerShown: true,
      headerTransparent: true,
      headerLeft: DrawerButton(navigation),
      headerRight: NotificationButton(navigation, hasUnreadNote),
    })}>
    <AppointmentStack.Screen
      name="Health Education"
      component={WellnessVideos}
      listeners={{
        focus: (e) => CheckUnreadNote(),
      }}
    />
  </AppointmentStack.Navigator>
);

const DoctorStackScreen = ({hasUnreadNote}) => (
  <DoctorStack.Navigator
    initialRouteName="FindDoctor"
    screenOptions={({navigation}) => ({
      title: '',
      headerShown: true,
      headerTransparent: true,
      headerLeft: BackButton(navigation),
      headerRight: NotificationButton(navigation, hasUnreadNote),
    })}>
    <DoctorStack.Screen
      name="FindDoctor"
      component={FindDoctorsScreen}
      listeners={{
        focus: (e) => CheckUnreadNote(),
      }}
    />
  </DoctorStack.Navigator>
);

const AssessmentStackScreen = ({}) => (
  <AssessmentStack.Navigator>
    <AssessmentStack.Screen name="Assessment" component={AssessmentScreen} />
  </AssessmentStack.Navigator>
);

const SettingsStackScreen = ({hasUnreadNote}) => {
  return (
    <SettingsStack.Navigator
      initialRouteName="Profile"
      screenOptions={({navigation}) => ({
        title: '',
        headerShown: true,
        headerTransparent: true,
        headerLeft: DrawerButton(navigation),
        headerRight: NotificationButton(navigation, hasUnreadNote),
      })}>
      <SettingsStack.Screen
        name="Profile"
        component={ProfileDetailScreen}
        listeners={{
          focus: (e) => CheckUnreadNote(),
        }}
      />
    </SettingsStack.Navigator>
  );
};

const TabsScreen = ({hasUnreadNote}) => {
  return (
    <Tab.Navigator tabBar={(props) => <AppTabBar {...props} />}>
      <Tab.Screen
        name="Dashboard"
        children={() => <HomeStackScreen hasUnreadNote={hasUnreadNote} />}
        options={{
          is_search: false,
          icon_img: require('../assets/images/tab_home.png'),
        }}
      />
      <Tab.Screen
        name="Appointment"
        children={() => (
          <AppointmentStackScreen hasUnreadNote={hasUnreadNote} />
        )}
        options={{
          is_search: false,
          icon_img: require('../assets/images/icon_calendar.png'),
        }}
      />
      <Tab.Screen
        name="FindDoctor"
        children={() => <DoctorStackScreen hasUnreadNote={hasUnreadNote} />}
        options={{
          tabBarVisible: false,
          is_search: true,
          icon_img: require('../assets/images/icon_search.png'),
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Tab.Screen
        name="Assessment"
        //children={() => <ToComeScreen hasUnreadNote={hasUnreadNote} />}
        children={() => (
          <VideosStackScreen hasUnreadNote={hasUnreadNote} />
        )}
        options={{
          is_search: false,
          unmountOnBlur: true,
          icon_img: require('../assets/images/tab_health.png'),
        }}
      />
      <Tab.Screen
        name="Settings"
        children={() => <SettingsStackScreen hasUnreadNote={hasUnreadNote} />}
        options={{
          is_search: false,
          icon_img: require('../assets/images/tab_user.png'),
        }}
      />
    </Tab.Navigator>
  );
};

const BackButton = (navigation) => () => (
  <AppButtonBack style={{marginLeft: 35}} btPress={() => navigation.goBack()} />
);

const DrawerButton = (navigation) => () => (
  <AppButtonIcon
    style={{marginLeft: 35}}
    btPress={() => navigation.navigate('Drawer')}>
    <Image
      style={{width: '43%', resizeMode: 'contain'}}
      source={require('../assets/images/icon_sidemenu.png')}
    />
  </AppButtonIcon>
);

const NotificationButton = (navigation, hasUnreadNote) => () => {
  const [lang, setLang] = useState(i18n.language);
  return (
    <View style={{flexDirection:"row"}}>
      <AppButtonIcon
        style={{marginRight: 10}}
        btPress={() => navigation.navigate('Notifications')}>
        <Image
          style={{width: '45%', resizeMode: 'contain'}}
          source={require('../assets/images/icon_notify_read.png')}
        />
        {hasUnreadNote ? (
          <Image
            style={{
              width: '30%',
              resizeMode: 'contain',
              position: 'absolute',
              right: 5,
              bottom: -10,
            }}
            source={require('../assets/images/online_status.png')}
          />
        ) : null}
      </AppButtonIcon>
      <AppButtonIcon
        style={{marginRight: 35}}
        btPress={() => {
          if(lang === "en") {
            i18n.changeLanguage("hi");
            setLang("hi");
          } else {
            i18n.changeLanguage("en");
            setLang("en");
          }
        }}>
        <Text style={{fontSize: 23, color: '#0D6BC8'}}>{lang != "en" ? "A" : "अ"}</Text>
      </AppButtonIcon>
    </View>
  );
};

const LanguageSelection = (navigation, hasUnreadNote) => () => {
  return (
    <AppButtonIcon
      style={{marginRight: 35}}
      btPress={() => navigation.navigate('Notifications')}>
      <Text style={{fontSize: 23}}>अ</Text>
    </AppButtonIcon>
  );
};

const CloseButton = (pressHandler) => () => (
  <AppButtonIcon style={{marginRight: 35}} btPress={pressHandler}>
    <Image
      style={{width: '43%', resizeMode: 'contain'}}
      source={require('../assets/images/close_icon.png')}
    />
  </AppButtonIcon>
);

export default function AppTabNavigator({
  initialRoute,
  screenProps,
  hasUnreadNote,
  checkUnreadNotification,
}) {
  CheckUnreadNote = checkUnreadNotification;
  return AppStackScreen({initialRoute, screenProps, hasUnreadNote});
}
