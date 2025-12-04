// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import LoginPage from "./pages/LoginPage";
import ListingsPage from "./pages/ListingsPage";
import UsersPage from "./pages/UsersPage";
import PrivateLayout from "./layouts/PrivateLayout";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateLayout>
                <ListingsPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateLayout>
                <UsersPage />
              </PrivateLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
