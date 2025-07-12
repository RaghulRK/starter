import { Link } from "react-router-dom";

const Navbar = () => {
  const navItems = [
    { name: "Contact Us", path: "/contactus" },
    { name: "Locate Us", path: "/locateus" },
    { name: "Help", path: "/help" },
  ];

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-xl font-bold tracking-wide hover:text-blue-200 transition"
        >
          Retail Banking
        </Link>

        {/* Navigation Items */}
        <div className="space-x-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-blue-200 transition"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
