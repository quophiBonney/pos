// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  // baseURL: "https://pos-backend-three-phi.vercel.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;
