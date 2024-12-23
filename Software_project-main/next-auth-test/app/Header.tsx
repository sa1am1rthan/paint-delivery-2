import React, { useState } from "react";
import "./style.css";
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const router = useRouter();

  const handleNavToggle = () => {
    setIsNavVisible(!isNavVisible);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const handleFeaturesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/features');
  };

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/products');
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/support');
  };

  return (
    <header>
      <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
        <img src="logo.png" style={{width:"50px"}} alt="Logo" />
        <h2 className="logo">PaintRouteX</h2>
      </div>
      <div className="mobile-nav-icon" onClick={handleNavToggle}>
        ☰
      </div>
      <nav className={`navigation ${isNavVisible ? "visible" : ""}`}>
        <a href="/" onClick={handleHomeClick}>Home</a>
        <a href="/features" onClick={handleFeaturesClick}>Features</a>
        <a href="/products" onClick={handleProductsClick}>Products</a>
        <a href="/support" onClick={handleSupportClick}>Support</a>
        <button className="btnLogin-popup" onClick={onLoginClick}>
          Login
        </button>
      </nav>
    </header>
  );
};

export default Header;
