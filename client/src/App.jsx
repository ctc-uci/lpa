import { PDFViewer } from "@react-pdf/renderer";
import { CookiesProvider } from "react-cookie";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { Admin } from "./components/admin/Admin";
import { CatchAll } from "./components/CatchAll";
import { Dashboard } from "./components/dashboard/Dashboard";
import { SingleInvoice } from "./components/invoices/SingleInvoice";
import { EditInvoice } from "./components/invoices/EditInvoice";
import { InvoicesDashboard } from "./components/invoices/InvoicesDashboard";
import { ForgotPassword } from "./components/forgotpassword/ForgotPassword";
import { ForgotPasswordSent } from "./components/forgotpassword/ForgotPasswordSent";
import { ResetPassword } from "./components/resetpassword/ResetPassword";
import { ResetPasswordSuccess } from "./components/resetpassword/ResetPasswordSuccess";
import { Login } from "./components/login/Login";
import { Notifications } from "./components/notifications/Notifications";
import PDFButton from "./components/PDFButton";
import { Playground } from "./components/playground/Playground";
import { EditProgram } from "./components/programs/EditProgram";
import { Program } from "./components/programs/Program";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Signup } from "./components/signup/Signup";
import { SignupRequested } from "./components/signup/SignupRequested";
import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";
import { RoleProvider } from "./contexts/RoleContext";
import { Home } from "./components/home/Home";
import { EditBooking } from "./components/bookings/EditBooking";
import { ArchivedPrograms } from "./components/programs/ArchivedPrograms";
import { Settings } from "./components/settings/Settings";

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
                  path="/playground"
                  element={<Playground />}
                />
                <Route
                  path ="/home"
                  element={<ProtectedRoute element={<Home />} />}
                />
                <Route
                  path="/notifications"
                  element={<ProtectedRoute element={<Notifications />} />}
                />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route
                  path="/invoices"
                  element={<ProtectedRoute element={<InvoicesDashboard />} />}
                />
                <Route
                  path="/invoices/:id"
                  element={<ProtectedRoute element={<SingleInvoice />} />}
                />
                <Route
                  path="/invoices/edit/:id"
                  element={<ProtectedRoute element={<EditInvoice />} />}
                />
                <Route
                  path="/programs/edit/:id"
                  element={<ProtectedRoute element={<EditProgram />} />}
                />
                <Route
                  path="/programs/:id"
                  element={<ProtectedRoute element={<Program />} />}
                />
                <Route
                  path="/settings"
                  element={<ProtectedRoute element={<Settings />} />}
                />
                <Route
                  path="*"
                  element={<ProtectedRoute element={<CatchAll />} />}
                />
                <Route
                  path="/bookings/edit/:id"
                  element={<ProtectedRoute element={<EditBooking />} />}
                />
                <Route
                  path='/programs/archived'
                  element={<ProtectedRoute element={<ArchivedPrograms/>} />}
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
