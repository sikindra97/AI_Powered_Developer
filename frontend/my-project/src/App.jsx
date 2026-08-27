import {
  Route,
  Routes
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GitHubConnect from "./pages/GitHubConnect.jsx";
import Repositories from "./pages/Repositories.jsx";
import RepositoryDetails from "./pages/RepositoryDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Productivity from "./pages/Productivity.jsx";
import Analysis from "./pages/Analysis.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected Routes */}

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/github/connect"
            element={<GitHubConnect />}
          />

          <Route
            path="/github/success"
            element={<GitHubConnect />}
          />

          <Route
            path="/github/error"
            element={<GitHubConnect />}
          />

          <Route
            path="/repositories"
            element={<Repositories />}
          />

          <Route
            path="/repositories/:owner/:repo"
            element={<RepositoryDetails />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/productivity"
            element={<Productivity />}
          />

          <Route
            path="/analysis"
            element={<Analysis />}
          />

          <Route
            path="/ai"
            element={<AIAssistant />}
          />

        </Route>
      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}