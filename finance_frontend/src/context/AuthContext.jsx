import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authAPI } from "../api/auth.api.js";
import toast from "react-hot-toast";

import { AuthContext } from "./auth.context.js";

const decodeUserFromToken = (token) => {
  const decoded = jwtDecode(token);
  return {
    id: decoded.sub,
    role: decoded.role,
    name: decoded.name,
    email: decoded.email,
    is_active: decoded.is_active,
  };
};

const getInitialAuthState = () => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) {
    return { token: null, user: null, isAuthenticated: false };
  }

  try {
    return {
      token: storedToken,
      user: decodeUserFromToken(storedToken),
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return { token: null, user: null, isAuthenticated: false };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuthState);

  const user = auth.user;
  const token = auth.token;
  const isAuthenticated = auth.isAuthenticated;

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      if (!response?.token) {
        throw new Error("Registration failed");
      }

      localStorage.setItem("token", response.token);
      setAuth({
        token: response.token,
        user: decodeUserFromToken(response.token),
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      const firstDetail = error.data?.error?.details?.[0]?.message;
      toast.error(
        firstDetail || error.data?.error?.message || error.data?.message || "Registration failed"
      );
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (!response?.token) {
        throw new Error("Invalid credentials");
      }

      localStorage.setItem("token", response.token);
      setAuth({
        token: response.token,
        user: decodeUserFromToken(response.token),
        isAuthenticated: true,
      });
      return response;
    } catch (error) {
      toast.error(error.data?.error?.message || error.data?.message || "Invalid credentials");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null, isAuthenticated: false });
  };

  const isRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    register,
    login,
    logout,
    isRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
