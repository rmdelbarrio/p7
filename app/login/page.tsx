// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToken } from "../../lib/auth";
import { API_BASE } from "../../lib/config"; // Import API_BASE
import { Bird } from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState(""); // State changed from email to username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Direct call to NestJS API
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        // NestJS returns { accessToken, refreshToken }
        saveToken(data.accessToken, data.refreshToken); 
        router.push("/");
      } else {
        // Use message/error from NestJS response
        setError(data.error || data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <Bird size={48} color="#1DA1F2" />
          <h2>Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.field}>
            <label>Username</label> 
            <input
              type="text" // Updated type to text for username
              required
              placeholder="Your unique username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className={styles.loginButton} disabled={loading || !username || !password}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className={styles.signupText}>
            Don't have an account?{" "}
            <Link href="/register" className={styles.signupLink}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
