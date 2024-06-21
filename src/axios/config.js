import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

console.log(dotenv.config().parsed.NODE_API_URL);

const instance = axios.create({
  baseURL: dotenv.config().parsed.NODE_API_URL,
  withCredentials: true
})

export default instance;