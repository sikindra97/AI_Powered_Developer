import axios from "axios";

const api = axios.create({
  baseURL:"http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});
//request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

//response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export default api;