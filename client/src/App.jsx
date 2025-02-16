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
import { Invoice } from "./components/invoices/Invoice";
import { InvoicesDashboard } from "./components/invoices/InvoicesDashboard";
import { ForgotPassword } from "./components/login/ForgotPassword";
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
                  element={<ProtectedRoute element={<Invoice />} />}
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
                  path="*"
                  element={<ProtectedRoute element={<CatchAll />} />}
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
