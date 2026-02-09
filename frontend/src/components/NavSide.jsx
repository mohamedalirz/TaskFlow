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


      <div className="profile">
        <div className="avatar">D</div>

        <div className="profile-info">
          <span className="name">dali</span>
          <span className="email">rezgyuihhamadali@gmail.com</span>
        </div>
      </div>
    </aside>
    </>
  );
}

export default NavSide;
