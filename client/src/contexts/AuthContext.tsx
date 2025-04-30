import { createContext, ReactNode, useEffect, useState } from "react";

import { CreateToastFnReturn, Spinner } from "@chakra-ui/react";

import { AxiosInstance } from "axios";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { NavigateFunction } from "react-router-dom";

import { auth } from "../utils/auth/firebase";
import { useBackendContext } from "./hooks/useBackendContext";

interface AuthContextProps {
  currentUser: User | null;
  signup: ({ email, password }: EmailPassword) => Promise<UserCredential>;
  login: ({ email, password }: EmailPassword, boxChecked: boolean) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: ({ email }: Pick<EmailPassword, "email">) => Promise<void>;
  handleRedirectResult: (
    backend: AxiosInstance,
    navigate: NavigateFunction,
    toast: CreateToastFnReturn
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

interface EmailPassword {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { backend } = useBackendContext();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async ({ email, password, first_name, last_name }: EmailPassword) => {
    if (currentUser) {
      signOut(auth);
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await backend.post("/users/create", {
      email: email,
      firebaseUid: userCredential.user.uid,
      first_name: first_name,
      last_name: last_name
    });

    return userCredential;
  };

  const login = async ({ email, password }: EmailPassword, boxChecked: boolean) => {
    if (currentUser) {
      signOut(auth);
    }

    const permissionType = boxChecked ? browserLocalPersistence : browserSessionPersistence;

    await setPersistence(auth, permissionType);

    const result = await signInWithEmailAndPassword(auth, email, password);

   if (boxChecked) {
      const loginExpirationDate = new Date();
      loginExpirationDate.setDate(loginExpirationDate.getDate() + 30);
      localStorage.setItem("loginExpiration", loginExpirationDate.toString());
   }
    else {
        localStorage.removeItem("loginExpiration");
    }
    return result;
  };

  const logout = () => {
    if (localStorage.getItem("loginExpiration")) {
      localStorage.removeItem("loginExpiration");
    }
    return signOut(auth);
  };

  const resetPassword = ({ email }: Pick<EmailPassword, "email">) => {
    return sendPasswordResetEmail(auth, email);
  };

  /**
   * Helper function which keeps our DB and our Firebase in sync.
   * If a user exists in Firebase, but does not exist in our DB, we create a new user.
   *
   * **If creating a DB user fails, we rollback by deleting the Firebase user.**
   */
  const handleRedirectResult = async (
    backend: AxiosInstance,
    navigate: NavigateFunction,
    toast: CreateToastFnReturn
  ) => {
    try {
      const result = await getRedirectResult(auth);

      if (result) {
        const response = await backend.get(`/users/${result.user.uid}`);
        if (response.data.length === 0) {
          try {
            await backend.post("/users/create", {
              email: result.user.email,
              firebaseUid: result.user.uid,
            });
          } catch (e) {
            await backend.delete(`/users/${result.user.uid}`);
            toast({
              title: "An error occurred",
              description: `Account was not created: ${e.message}`,
              status: "error",
            });
          }
        }
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Redirect result error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // on mount, check if users session expires (30 days)

    const checkSessionExpiration = () => {
      const expirationDate = localStorage.getItem("loginExpiration");
      if (expirationDate) {
        const date = new Date(expirationDate);
        if (date < new Date()) {
          logout();
        }
      }
    }
    checkSessionExpiration();

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        handleRedirectResult,
      }}
    >
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};
