import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import argFlag from '../assets/images/arg.jpg';
import eeuuFlag from '../assets/images/eeuu.jpg';
import logo from '../assets/images/favicon-32x32.png';

function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (lang) => {
    if (lang !== language) toggleLanguage();
    setLangOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <NavLink className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <img src={logo} alt="DeepContact" width="28" height="28" />
          {t('nav.brand')}
        </NavLink>
        <button
          className={`navbar-toggler ${menuOpen ? 'open' : ''}`}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/" onClick={closeMenu}>
                {t('nav.home')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/about" onClick={closeMenu}>
                {t('nav.about')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/como-funciona" onClick={closeMenu}>
                {t('nav.howItWorks')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/contacto" onClick={closeMenu}>
                {t('nav.contact')}
              </NavLink>
            </li>
          </ul>
          <a
            href="https://deepcontact.com.ar/login"
            target="_blank"
            rel="noopener noreferrer"
            className="lang-toggle me-2 text-decoration-none"
            onClick={closeMenu}
          >
            <span className="lang-code">Login</span>
          </a>
          <div className="lang-dropdown" ref={dropdownRef}>
            <button
              className="lang-toggle"
              onClick={() => setLangOpen(!langOpen)}
            >
              <img src={language === 'es' ? argFlag : eeuuFlag} alt="" className="lang-flag-img" />
              <span className="lang-code">{language.toUpperCase()}</span>
              <span className="lang-arrow">▾</span>
            </button>
            {langOpen && (
              <div className="lang-menu">
                <button
                  className={`lang-option ${language === 'es' ? 'active' : ''}`}
                  onClick={() => selectLanguage('es')}
                >
                  <img src={argFlag} alt="Argentina" className="lang-flag-img" />
                  <span>Español</span>
                </button>
                <button
                  className={`lang-option ${language === 'en' ? 'active' : ''}`}
                  onClick={() => selectLanguage('en')}
                >
                  <img src={eeuuFlag} alt="USA" className="lang-flag-img" />
                  <span>English</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
