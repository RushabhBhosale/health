import client from "./client";

const endpoint = "/fcmToken";

const addFcmToken = (dataObj, userId) => client.post(endpoint + "/" + userId, dataObj);

const getFcmToken = (userId) => client.get(endpoint+'/user/'+userId);


export default { addFcmToken, getFcmToken };