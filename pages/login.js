// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Store user data, session info, and auth token
        localStorage.setItem("username", username);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("auth-token", data.token); // Store the token
        
        setMessage("✅ Login successful!");
        
        // Redirect to intended page or dashboard
        const redirectTo = router.query.redirect || "/dashboard";
        router.push(redirectTo);
      } else {
        setMessage(data.message || "❌ Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
            disabled={isLoading}
            autoComplete="username"
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        <button 
          type="submit"
          className={`${styles.button} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <div className={`${styles.message} ${message.includes('✅') ? styles.messageSuccess : styles.messageError}`}>
          {message}
        </div>
      )}
    </div>
  );
}