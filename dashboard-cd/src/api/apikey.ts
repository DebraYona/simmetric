/* eslint-disable import/prefer-default-export */
import { API, Auth } from 'aws-amplify';

export const listKeys = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  console.log(token);
  const result = await API.get('noti', '/keys', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return result.data;
};

export const createNewKey = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  console.log(token);

  const result = await API.post('noti', '/keys', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  console.log('Result', result);
  return result.data;
};

/**
 * Change the current status of the API Key disable<->enable
 *
 * Status is a string by requirements of the AWS API.
 * @param keyId {string} API Key Id
 * @param status {string} true or false
 */
export const changeApiKeyStatus = async (keyId: string, status: string) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();

  const result = await API.put('noti', '/keys', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      keyId,
      operation: 'status',
      value: status
    }
  });
  return result;
};

/**
 * Delete an API Key
 *
 * Status is a string by requirements of the AWS API.
 * @param apiKeyId {string}
 * @param status {string}
 */
export const deleteApiKey = async (keyId: string) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();

  const result = await API.del('noti', '/keys', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      keyId
    }
  });
  return result;
};
