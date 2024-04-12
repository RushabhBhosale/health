import JwtDecode from 'jwt-decode';
import {useContext} from 'react';
import AuthContext from './context';
import authStorage from './storage';

export default useAuth = () => {
  const {user, setUser} = useContext(AuthContext);

  const logOut = async () => {
    await authStorage.removeToken();
    await authStorage.removeUser();
    setUser(null);
  };

  const login = async (authToken, userData) => {
    const authuser = JwtDecode(authToken);
    const setUserData = !userData ? authuser : userData;
    await authStorage.setUser(setUserData);
    await authStorage.setToken(authToken);
    setUser(setUserData);
    // console.log(user);
    return setUserData;
  };

  const profile = async (userData) => {
    await authStorage.setUser(userData);
    setUser(userData);
  };

  return {logOut, login, profile};
};
