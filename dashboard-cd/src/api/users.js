/* eslint-disable import/prefer-default-export */
import { Auth, API } from 'aws-amplify';

// export const createSource = async (name, description) => {
//   const token = (await Auth.currentSession()).getIdToken().getJwtToken();
//   try {
//     const result = await API.post('tv', '/sources', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       },
//       body: {
//         name,
//         description
//       }
//     });

//     return result.data.sourceId;
//   } catch (e) {
//     return false;
//   }
// };

export const getUsers = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  const result = await API.get('tv', 'users', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return result.data;
};

export const createUser = async body => {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const result = await API.post('tv', 'users', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    });

    return result.data;
  } catch (error) {
    return error.response.data;
  }
};
