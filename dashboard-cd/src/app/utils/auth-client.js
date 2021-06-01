import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
import Config from '../../config';

async function confirmNewPassword(email, code, newPassword) {
  await Auth.forgotPasswordSubmit(email, code, newPassword);
}

async function confirmRegister(email, code) {
  try {
    const data = await Auth.confirmSignUp(email, code, {
      // Optional. Force user confirmation irrespective of existing alias. By default set to True.
      forceAliasCreation: true
    });
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function forgotPassword(email) {
  await Auth.forgotPassword(email);
}

async function isLoggedIn() {
  const user = await Auth.currentAuthenticatedUser({
    bypassCache: false // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
  });
  return user;
}

async function login(username, password, newPassword) {
  const user = await Auth.signIn(username, password);
  if (
    user.challengeName === 'SMS_MFA' ||
    user.challengeName === 'SOFTWARE_TOKEN_MFA'
  ) {
    console.log('MFA code challenge');
    // You need to get the code from the UI inputs
    // and then trigger the following function with a button click
    // const code = getCodeFromUserInput();
    // If MFA is enabled, sign-in should be confirmed with the confirmation code
    // const loggedUser = await Auth.confirmSignIn(
    //   user, // Return object from Auth.signIn()
    //   code, // Confirmation code
    //   mfaType // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
    // );
  } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
    console.log('New password required');

    // const { requiredAttributes } = user.challengeParam; // the array of required attributes, e.g ['email', 'phone_number']
    // You need to get the new password and required attributes from the UI inputs
    // and then trigger the following function with a button click
    // For example, the email and phone_number are required attributes
    // const { username, email, phone_number } = Auth.getInfoFromUserInput();

    const loggedUser = await Auth.completeNewPassword(
      user, // the Cognito User Object
      password // the new password
      // OPTIONAL, the required attributes
      // {
      //   email,
      //   phone_number
      // }
    );
    return loggedUser;
  } else if (user.challengeName === 'MFA_SETUP') {
    // This happens when the MFA method is TOTP
    // The user needs to setup the TOTP before using it
    // More info please check the Enabling MFA part
    Auth.setupTOTP(user);
  } else {
    // The user directly signs in
  }
  return user;
}

async function logout() {
  await Auth.signOut();
}

async function register(email, password, firstName, lastName) {
  const data = await Auth.signUp({
    username: email,
    password,
    attributes: {
      email, // optional
      'custom:firstName': firstName,
      'custom:lastName': lastName
    }
  });

  return data;
}

async function resendConfirm(email) {
  try {
    await Auth.resendSignUp(email);
    return true;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Fetch JWT token from current session
 *
 * @param {CognitoUser} currentUser - Cognito User from storage
 * @returns {Promise<string>} - Promise resolves with the JWT session ID token
 */
export const getUserToken = currentUser =>
  new Promise((resolve, reject) => {
    currentUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });

/**
 * Fetch AWS credentials using AWS SDK
 *
 * @param {string} token - Cognito User Pool token or Third Party acceess token
 * @param {string} provider - Name of the authenticated provider
 * @returns {Promise<object>} - Object containing properties: accessKeyId, secretAccessKey,
 * sessionToken
 */
export const getAwsCredentials = (token, provider) =>
  new Promise((resolve, reject) => {
    let providerKey = '';

    switch (provider) {
      case 'user_pool':
        providerKey = `cognito-idp.${Config.cognito.REGION}.amazonaws.com/${Config.cognito.USER_POOL_ID}`;
        break;
      case 'facebook':
        providerKey = 'graph.facebook.com';
        break;
      case 'google':
        providerKey = 'accounts.google.com';
        break;
      case 'amazon':
        providerKey = 'www.amazon.com';
        break;
      default:
        break;
    }

    AWS.config.region = Config.cognito.REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: Config.cognito.IDENTITY_POOL_ID,
      Logins: {
        [providerKey]: token
      }
    });

    AWS.config.credentials.get(error => {
      if (error) {
        reject(error);
      }

      const {
        accessKeyId,
        secretAccessKey,
        sessionToken
      } = AWS.config.credentials;
      const credentialSubset = { accessKeyId, secretAccessKey, sessionToken };
      resolve(credentialSubset);
    });
  });

export default {
  confirmNewPassword,
  confirmRegister,
  forgotPassword,
  isLoggedIn,
  login,
  logout,
  register,
  resendConfirm
};
