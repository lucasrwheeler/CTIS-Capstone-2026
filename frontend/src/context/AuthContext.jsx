import { createContext, useContext, useState, useEffect } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "../config/cognito";

const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId:   COGNITO_CONFIG.ClientId
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [idToken, setIdToken]         = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!cognitoUser) { setLoading(false); return; }

    cognitoUser.getSession((err, session) => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (err || !session.isValid()) { setLoading(false); return; }

      const token   = session.getIdToken().getJwtToken();
      const payload = session.getIdToken().payload;

      setIdToken(token);
      setCurrentUser({
        email:          payload.email,
        role:           payload["custom:role"]           || "student",
        professor_name: payload["custom:professor_name"] || ""
      });
      setLoading(false);
    });
  }, []);

  function signup({ email, password, role, professor_name }) {
    return new Promise((resolve, reject) => {
      const attrs = [
        new CognitoUserAttribute({ Name: "custom:role",           Value: role }),
        new CognitoUserAttribute({ Name: "custom:professor_name", Value: professor_name || "" })
      ];
      userPool.signUp(email, password, attrs, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  function confirmSignup(email, code) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess(session) {
          const token   = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().payload;
          setIdToken(token);
          setCurrentUser({
            email:          payload.email,
            role:           payload["custom:role"]           || "student",
            professor_name: payload["custom:professor_name"] || ""
          });
          resolve(session);
        },
        onFailure(err) { reject(err); }
      });
    });
  }

  function logout() {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    setCurrentUser(null);
    setIdToken(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, idToken, loading, signup, confirmSignup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}