import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || null
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then((response) => {
        const currentUser =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data ||
          null;

        setUser(currentUser);

        if (currentUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
          );
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password
      }
    );

    const token =
      response.data?.token ||
      response.data?.data?.token;

    const currentUser =
      response.data?.user ||
      response.data?.data?.user ||
      response.data?.data ||
      null;

    if (token) {
      localStorage.setItem(
        "token",
        token
      );
    }

    if (currentUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );
    }

    setUser(currentUser);

    return response.data;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password
      }
    );

    const token =
      response.data?.token ||
      response.data?.data?.token;

    const currentUser =
      response.data?.user ||
      response.data?.data?.user ||
      response.data?.data ||
      null;

    if (token) {
      localStorage.setItem(
        "token",
        token
      );
    }

    if (currentUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );
    }

    setUser(currentUser);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}