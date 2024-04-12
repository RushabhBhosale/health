import React, {useContext, useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {responsiveWidth} from 'react-native-responsive-dimensions';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OtpScreen from '../screens/OtpScreen';
import PersonalDetailScreen from '../screens/PersonalDetailScreen';
import PermissionScreen from '../screens/PermissionScreen';
import CongratScreen from '../screens/CongratScreen';
import AppButtonBack from '../components/AppButtonBack';
import AppStyles from '../config/style';

const Stack = createStackNavigator();

export default function AuthNavigator({initialRoute = 'Welcome'}) {
  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName={initialRoute}
      screenOptions={({navigation}) => ({
        title: '',
        headerShown: true,
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
        name="Welcome"
        component={WelcomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={OtpScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="PersonalDetails"
        component={PersonalDetailScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Permission"
        component={PermissionScreen}
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Congrats"
        component={CongratScreen}
        options={{
          title: '',
          headerShown: false,
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}
