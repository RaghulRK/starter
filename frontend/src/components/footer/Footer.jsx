import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-800 text-white py-6 mt-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left Side: Copyright */}
        <div className="text-center md:text-left">
          <p className="text-sm text-blue-200">© {year} Retail Banking. All rights reserved.</p>
        </div>

        {/* Right Side: Policy Links */}
        <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-blue-100 text-center md:text-right space-y-2 sm:space-y-0">
          <Link
            to="/privacy-policy"
            className="hover:text-white underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            to="/disclaimer"
            className="hover:text-white underline-offset-4 hover:underline"
          >
            Disclaimer
          </Link>
          <Link
            to="/terms-and-conditions"
            className="hover:text-white underline-offset-4 hover:underline"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
