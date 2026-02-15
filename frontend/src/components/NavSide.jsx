import { useNavigate, useLocation } from "react-router-dom";
import "../style/NavSide.css";

function NavSide() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <>
    <aside className="side">
      <h2 className="logo">🚀 TaskFlow</h2>

      <button
        className={`nav ${location.pathname === "/dashboard" ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
      <button
        className={`nav ${location.pathname === "/logout" ? "active" : ""}`}
        onClick={() => handleLogout()}
      >
        Logout
      </button>


      
    </aside>
    </>
  );
}

export default NavSide;
