// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  // baseURL: "https://posbackend-ecru.vercel.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;
