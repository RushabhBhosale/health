import client from './client';

const endpoint = '/notification';

const updateVideoNotification = (dataObj) =>
  client.post(endpoint + '/videocallstatus', dataObj);

const postNotification = (dataObj) => client.post(endpoint, dataObj);

const updateReadAt = (_id) => client.put(endpoint + '/readAt/' + _id);

const getNotification = (noteFor, userId) =>
  client.get(endpoint + '/user/' + noteFor + '/' + userId);

const hasUnread = (noteFor, userId) =>
  client.get(endpoint + '/has-unread/' + noteFor + '/' + userId);

const postAdminNotification = (dataObj) =>
  client.post(endpoint + '/admin', dataObj);

export default {
  getNotification,
  postNotification,
  updateReadAt,
  updateVideoNotification,
  hasUnread,
  postAdminNotification,
};
