import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./components/Homepage/HomePage";
// import Vertical from './components/vertical';
// import Parameter from './components/parameter';
import Node from "./components/statics/node";
import Historystatus from "./components/Historystatus/Historystatus";
import AlertPage from "./components/statics/AlertPage";
import "./styles.css";
import Status from "./components/Statustable/statustable";
import Platform from "./components/Platform/platform";
import Addvertical from "./components/Addvertical/Addvertical";
import BulkPage from "./components/Bulk/BulkPage";
import Login from "./components/usermanagement/Login";
import Notification from "./components/Notification/notification";
import Notificationcount from "./components/Notification/notificationcount";
import Analytics from "./components/statics/analytics";
import Predefinedconfigurations from "./components/Predefinedconfiguration/Predefinedconfigurations";
import MultiPredefinedconfigurations from "./components/Predefinedconfiguration/MultiPredefinedconfigurations";

import { AuthProvider } from "./components/usermanagement/AuthContext"; // Import AuthProvider
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import CreateUser from "./components/usermanagement/createuser";
function App() {
  return (
    // Move the AuthProvider inside Router
    <Router>
      <AuthProvider>
        {" "}
        {/* Wrap your app inside AuthProvider here */}
        <Navbar />
        <div className="content">
          <Routes>
            {/* Public Route: Login */}
            <Route path="/Node-Simultor/Login" element={<Login />} />

            {/* Protected Routes (accessible only if authenticated) */}
            <Route
              path="/Node-Simultor"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/Node-Simultor/vertical"
              element={
                <ProtectedRoute>
                  <Vertical />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/Node-Simultor/parameter"
              element={
                <ProtectedRoute>
                  <Parameter />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/Node-Simultor/node"
              element={
                <ProtectedRoute>
                  <Node />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/platform"
              element={
                <ProtectedRoute>
                  <Platform />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/Predefinedconfigurations"
              element={
                <ProtectedRoute>
                  <Predefinedconfigurations />
                </ProtectedRoute>
              }
            />

           <Route
              path="/Node-Simultor/MultiPredefinedconfigurations"
              element={
                <ProtectedRoute>
                  <MultiPredefinedconfigurations/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/Node-Simultor/Historystatus"
              element={
                <ProtectedRoute>
                  <Historystatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/Addvertical"
              element={
                <ProtectedRoute>
                  <Addvertical />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/Notification"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/Notificationcount"
              element={
                <ProtectedRoute>
                  <Notificationcount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/Analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/BulkPage"
              element={
                <ProtectedRoute>
                  <BulkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/AlertPage"
              element={
                <ProtectedRoute>
                  <AlertPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Node-Simultor/createuser"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown paths to HomePage */}
            <Route path="*" element={<Navigate to="/Node-Simultor" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
