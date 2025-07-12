import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth/token if implemented
    // localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    "Accounts",
    "Deposits",
    "Loans",
    "Cards",
    "Fund Transfer",
    "Bill Payments",
    "Services",
    "Settings",
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Menus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item}
            className="bg-white shadow-md rounded p-4 text-center hover:shadow-lg transition"
          >
            <p className="text-blue-800 font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
