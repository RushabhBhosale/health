// import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import JwtDecode from "jwt-decode";

const key = "authToken";

const setToken = async (authToken) => {
  try {
    await AsyncStorage.setItem(key, authToken);
  } catch (error) {
    console.error("Error storing authtoken", error);
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error("error getting authToken", error);
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing the authtoken", error);
  }
};

const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('userProfile');
    return JSON.parse(user)
  } catch (error) {
    console.error("error getting user", error);
  }
};

const setUser = async (user) => {
  try {
    await removeUser();
    await AsyncStorage.setItem('userProfile', JSON.stringify(user));
  } catch (error) {
    console.error("Error storing authtoken", error);
  }
};

const removeUser = async () => {
  try {
    await AsyncStorage.removeItem('userProfile');
  } catch (error) {
    console.error("Error removing the 'userProfile'", error);
  }
};

const setFcmToken = async (fcmToken) => {

  try {
    await AsyncStorage.setItem('deviceFcmToken', fcmToken);
  } catch (error) {
    console.error("Error storing deviceFcmToken", error);
  }
};

const getFcmToken = async () => {
  try {
    return await AsyncStorage.getItem('deviceFcmToken');
  } catch (error) {
    console.error("error getting authToken", error);
  }
};

const removeFcmToken = async () => {
  try {
    return await AsyncStorage.removeItem('deviceFcmToken');
  } catch (error) {
    console.error("error getting authToken", error);
  }
};


const setTempFcmToken = async (fcmToken) => {

  try {
    await AsyncStorage.setItem('deviceTempFcmToken', fcmToken);
  } catch (error) {
    console.error("Error storing deviceTempFcmToken", error);
  }
};

const getTempFcmToken = async () => {
  try {
    return await AsyncStorage.getItem('deviceTempFcmToken');
  } catch (error) {
    console.error("error getting deviceTempFcmToken", error);
  }
};

const removeTempFcmToken = async () => {
  try {
    return await AsyncStorage.removeItem('deviceTempFcmToken');
  } catch (error) {
    console.error("error getting deviceTempFcmToken", error);
  }
};

export default {
  getUser,
  setToken,
  removeToken,
  getToken,
  setUser,
  removeUser,
  setFcmToken,
  getFcmToken,
  removeFcmToken,
  setTempFcmToken,
  getTempFcmToken,
  removeTempFcmToken
};
