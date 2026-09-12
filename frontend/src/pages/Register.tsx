import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { RegisterResponse } from "../types/auth";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post<RegisterResponse>(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert(response.data.message);
      navigate("/login");
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.details) {
        setError(
          data.details
            .map((item: { field: string; message: string }) =>
              `${item.field}: ${item.message}`
            )
            .join(", ")
        );
      } else {
        setError(
          data?.error ||
            "Registration failed. Please try again."
        );
      }
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
          Create Account
        </h1>

        <p style={{ color: "#666", marginBottom: "24px" }}>
          Register for the Velozity Dashboard
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
          <label>Name</label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
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
            placeholder="Minimum 8 characters"
            required
            minLength={8}
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;