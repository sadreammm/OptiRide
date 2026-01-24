import { createContext, useState, useContext, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { apiClient as api } from "../utils/api.config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('optiride_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const idToken = await firebaseUser.getIdToken();
            const response = await api.post('/auth/login', {
                credentials: idToken
            });

            const { token: tokenData, user: userData } = response.data;

            console.log("[DEBUG] Login response:", response.data);
            console.log("[DEBUG] Token data object:", tokenData);
            console.log("[DEBUG] Extracted token string:", tokenData.token);

            localStorage.setItem('optiride_token', tokenData.token);
            localStorage.setItem('optiride_user', JSON.stringify(userData));

            // Verify it was saved
            const savedToken = localStorage.getItem('optiride_token');
            console.log("[DEBUG] Token saved to localStorage. Verification:", savedToken === tokenData.token ? "SUCCESS" : "FAILED");
            console.log("[DEBUG] Saved token (first 50 chars):", savedToken?.substring(0, 50));

            setUser(userData);
            return { success: true, role: userData.user_type };

        } catch (error) {
            console.error("Login error:", error);
            let message = "An error occurred during login.";
            if (error.response) {
                message = error.response.data.detail || "Login failed.";
            } else if (error.code) {
                message = error.code;
            }
            return { success: false, message };
        }
    }
    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('optiride_token');
        localStorage.removeItem('optiride_user');
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}