import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "#f4f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>
          Velozity Dashboard
        </h1>

        <p style={{ color: "#666", marginBottom: "24px" }}>
          Sign in to your account
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              marginBottom: "16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              border: "none",
              borderRadius: "6px",
              background: "#2563eb",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;