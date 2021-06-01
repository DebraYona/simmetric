/* eslint-disable import/prefer-default-export */
import { userActions } from '../config/actions';
import { getUsers, createUser } from '../../api/users';

function userIsLoading() {
  return {
    type: userActions.USERS_IS_LOADING
  };
}

function userError(e) {
  return {
    type: userActions.USERS_ERROR,
    error: e
  };
}

function userSet(users) {
  return {
    type: userActions.USERS,
    data: users
  };
}

function newUser(result) {
  return {
    type: userActions.USERS_NEW,
    data: result
  };
}

// function newuserAdd(user) {
//   return {
//     type: userActions.USERS_NEW,
//     data: source
//   };
// }

/**
 * Handle a new message arriving. Cognito identity id is parsed from topic. If user is cached,
 * build message immediately. Otherwise, query API for user information based on identity id.
 *
 * @param {string} message - the message
 * @param {string} topic - the topic of the form room/public/+/cognitoId
 */
// export const newSource = (name, description) => {
//   return async dispatch => {
//     console.log('new source');
//     dispatch(sourceIsLoading());
//     try {
//       const sourceId = await createSource(name, description);
//       if (sourceId) {
//         dispatch(newSourceAdd({ name, description, sourceId }));
//       } else {
//         dispatch(sourceError('Could not create source'));
//       }
//     } catch (error) {
//       dispatch(sourceError(error));
//     }
//   };
// };

export const fetchUsers = () => {
  return async dispatch => {
    dispatch(userIsLoading());
    try {
      const users = await getUsers();
      dispatch(userSet(users));
    } catch (error) {
      dispatch(userError(error));
    }
    console.log('get users');
  };
};

export const userCreation = body => {
  return async dispatch => {
    dispatch(userIsLoading());
    try {
      const result = await createUser(body);
      if (result.statusCode === 400) {
        dispatch(userError(result));
        return false;
      }
      dispatch(newUser(result));
      return true;
    } catch (error) {
      console.log(error);
      dispatch(userError(error));
      return false;
    }
  };
};
