// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bird } from "lucide-react";
import { API_BASE } from "../../lib/config"; // Import API_BASE
import styles from "./register.module.css";

export default function RegisterPage() {
  const [username, setUsername] = useState(""); // State changed from name to username
  const [email, setEmail] = useState(""); // Kept for the form, but not used by the backend API
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Direct call to NestJS API
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // NestJS Register endpoint only needs username and password
        body: JSON.stringify({ username, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Registration failed"); 
      }
    } catch(error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <Bird size={48} color="#1DA1F2" />
          <h2>Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.field}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Your unique username" // Updated placeholder
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Updated setter
            />
          </div>

          <div className={styles.field}>
            <label>Email (Optional)</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button className={styles.registerButton} disabled={loading || !username || !password || password !== confirm}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className={styles.loginText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.loginLink}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
