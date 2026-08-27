import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
========================================================
REQUEST INTERCEPTOR
========================================================
*/

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    console.log(
      "API:",
      config.method?.toUpperCase(),
      config.url
    );

    console.log(
      "JWT exists:",
      Boolean(token)
    );

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

/*
========================================================
RESPONSE INTERCEPTOR
========================================================
*/

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