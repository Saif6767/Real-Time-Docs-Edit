import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Tailwind active style function
  const activeClass = ({ isActive }) =>
    isActive
      ? "bg-white text-blue-600 px-4 py-2 rounded-md font-semibold transition"
      : "text-white hover:text-gray-200 font-semibold transition";

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-md px-6 py-4 flex justify-between items-center">
      <NavLink
        to="/"
        className="text-2xl font-bold text-white hover:text-gray-200"
      >
        DocCollab
      </NavLink>

      <div className="flex items-center gap-4">
        {isAuth ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" className={activeClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={activeClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
