// App.js
import './App.css';
import Navbar from "./components/navbar/Navbar";
import Footer from './components/footer/Footer';
import Login from "./pages/Login";
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// 👇 Layout wrapper with access to useLocation
function Layout() {
  const location = useLocation();
  const hideOnRoutes = ["/register", "/dashboard"];
  const shouldHideNavbarFooter = hideOnRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>

      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}

// 👇 Root component
function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
