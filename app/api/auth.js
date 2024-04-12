import client from "./client";

const login = (phone) =>
  client.post("/auth", phone);

export default { login };
