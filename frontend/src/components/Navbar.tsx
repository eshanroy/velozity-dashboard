import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        background: "#111827",
        color: "white",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>
          Velozity Dashboard
        </h2>

        <small style={{ color: "#9ca3af" }}>
          Real-Time Client Project Dashboard
        </small>
      </div>

      {user && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div>{user.name}</div>

            <small style={{ color: "#9ca3af" }}>
              {user.role}
            </small>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              border: "1px solid #4b5563",
              borderRadius: "6px",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;