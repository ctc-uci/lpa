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
import { Playground } from "./components/playground/Playground";
import { Login } from "./components/login/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Signup } from "./components/signup/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ForgotPassword } from "./components/login/ForgotPassword";
import { PDFViewer } from "@react-pdf/renderer";
import PDFButton from "./components/PDFButton";
import { InvoicesDashboard } from "./components/invoices/InvoicesDashboard";

const App = () => {
  return (
    <CookiesProvider>
      <BackendProvider>
        <AuthProvider>
          <RoleProvider>
            <Router>
              <Routes>
                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route
                  path="/signup"
                  element={<Signup />}
                />
                <Route
                  path="/playground"
                  element={<Playground />}
                />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route 
                  path="/invoices"
                  // element={<ProtectedRoute element={<InvoicesDashboard />} />}
                  element={<InvoicesDashboard />}
                />
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
                  path="/forgotpassword"
                  element={<ForgotPassword />}
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
