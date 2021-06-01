/* eslint-disable import/prefer-default-export */
import { Auth, API } from 'aws-amplify';

export const createSource = async (name, description) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  try {
    const result = await API.post('noti', '/sources', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        name,
        description
      }
    });
    console.log(result);
    return result.data.sourceId;
  } catch (e) {
    return false;
  }
};

export const getSources = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  console.log(token);
  const result = await API.get('tv', '/', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(result);

  return result.data;
};
