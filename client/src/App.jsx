import React, { createContext, useContext, useEffect, useState } from "react";

import { PDFViewer } from "@react-pdf/renderer";
import { CookiesProvider } from "react-cookie";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { Admin } from "./components/admin/Admin";
import { EditBooking } from "./components/bookings/EditBooking";
import { CatchAll } from "./components/CatchAll";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ForgotPassword } from "./components/forgotpassword/ForgotPassword";
import { ForgotPasswordSent } from "./components/forgotpassword/ForgotPasswordSent";
import { Home } from "./components/home/Home";
import { EditInvoice } from "./components/invoices/EditInvoice";
import { InvoicesDashboard } from "./components/invoices/InvoicesDashboard";
import { SavedEdit } from "./components/invoices/SavedEditsInvoice";
import { SingleInvoice } from "./components/invoices/SingleInvoice";
import { Login } from "./components/login/Login";
import { Notifications } from "./components/notifications/Notifications";
import PDFButton from "./components/PDFButton";
import { Playground } from "./components/playground/Playground";
import { ArchivedPrograms } from "./components/programs/ArchivedPrograms";
import { ModifyProgram } from "./components/programs/ModifyProgram";
import { Program } from "./components/programs/Program";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ResetPassword } from "./components/resetpassword/ResetPassword";
import { ResetPasswordSuccess } from "./components/resetpassword/ResetPasswordSuccess";
import { Settings } from "./components/settings/Settings";
import { Signup } from "./components/signup/Signup";
import { SignupRequested } from "./components/signup/SignupRequested";
import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";
import { RoleProvider } from "./contexts/RoleContext";

const App = () => {
  return (
    <CookiesProvider>
      <BackendProvider>
        <AuthProvider>
          <RoleProvider>
            <Router>
              <Routes>
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute
                      element={<Admin />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/"
                  element={
                    <Navigate
                      to="/login"
                      replace
                    />
                  }
                />
                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route
                  path="/signup"
                  element={<Signup />}
                />
                <Route
                  path="/signup/requested"
                  element={<SignupRequested />}
                />
                <Route
                  path="/forgotpassword"
                  element={<ForgotPassword />}
                />
                <Route
                  path="/forgotpassword/sent"
                  element={<ForgotPasswordSent />}
                />
                <Route
                  path="/resetpassword"
                  element={<ResetPassword />}
                />
                <Route
                  path="/resetpassword/success"
                  element={<ResetPasswordSuccess />}
                />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route
                  path="/playground"
                  element={<Playground />}
                />

                {/* ADMIN ONLY oh my goodness! */}
                <Route
                  path="/programs"
                  element={
                    <ProtectedRoute
                      element={<Home />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute
                      element={<Notifications />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute
                      element={<InvoicesDashboard />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/invoices/:id"
                  element={
                    <ProtectedRoute
                      element={<SingleInvoice />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/invoices/edit/:id"
                  element={
                    <ProtectedRoute
                      element={<EditInvoice />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/invoices/savededits/:id"
                  element={
                    <ProtectedRoute
                      element={<SavedEdit />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/programs/:id"
                  element={
                    <ProtectedRoute
                      element={<Program />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/programs/edit/:id"
                  element={
                    <ProtectedRoute
                      element={<ModifyProgram load={true} />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/addprogram"
                  element={
                    <ProtectedRoute
                      element={<ModifyProgram load={false} />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute
                      element={<Settings />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute
                      element={<CatchAll />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/bookings/edit/:id"
                  element={
                    <ProtectedRoute
                      element={<EditBooking />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
                <Route
                  path="/programs/archived"
                  element={
                    <ProtectedRoute
                      element={<ArchivedPrograms />}
                      allowedRoles={["admin"]}
                    />
                  }
                />
              </Routes>
            </Router>
          </RoleProvider>
        </AuthProvider>
      </BackendProvider>
    </CookiesProvider>
  );
};

export default App;
