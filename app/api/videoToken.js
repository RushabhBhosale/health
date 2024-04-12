import client from "./client";

const endpoint = "/videoToken";

const getVideoToken = (channelName, uid) => client.get(endpoint+"/"+channelName+"/"+uid);

export default { getVideoToken };
