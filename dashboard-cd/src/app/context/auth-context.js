import React, { useState, useEffect, useContext, createContext } from 'react';
import AuthClient from '../utils/auth-client';

const authContext = createContext();

function useProvideAuth() {
  const [isLoggedIn, setLoggedIn] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    const user = await AuthClient.login(email.toLowerCase().trim(), password);
    setLoggedIn(true);
    setUserInfo(user);
  };

  const register = async (email, password, firstName, lastName) => {
    await AuthClient.register(email, password, firstName, lastName);
  };

  const forgotCode = async email => {
    await AuthClient.forgotPassword(email);
  };

  const forgotConfirm = async (email, code, newPassword) => {
    AuthClient.confirmNewPassword(email, code, newPassword);
  };

  const logout = async () => {
    await AuthClient.logout();
    setLoggedIn(false);
  };

  const confirmCode = async (email, code) => {
    await AuthClient.confirmRegister(email, code);
  };

  useEffect(() => {
    async function setUp() {
      if (!isLoggedIn) {
        try {
          const user = await AuthClient.isLoggedIn();
          setUserInfo(user);
          setLoggedIn(true);
        } catch (e) {
          setLoggedIn(false);
        }
      }
    }
    setUp();

    return () => ({});
  }, [isLoggedIn]);

  return {
    isLoggedIn,
    login,
    register,
    logout,
    forgotCode,
    forgotConfirm,
    confirmCode,
    userInfo
  };
}

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(authContext);
  if (context === undefined) {
    throw Error(`useAuth must be used within a ProvideAuth`);
  }
  return useContext(authContext);
};
