/* eslint-disable import/prefer-default-export */
import { API, Auth } from 'aws-amplify';

type NotificationData = {
  createdAt: string;
  payload: string;
  sourceId: string;
  tenantId: string;
  updatedAt: string;
};

export const getNotifications = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  const result = await API.get('noti', '/notifications', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const items = result.data.map((d: NotificationData) => {
    const item = JSON.parse(d.payload);
    return item;
  });
  return items;
};
