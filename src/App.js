import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About.jsx';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login.jsx';
import Backoffice from './backoffice/App';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login' || pathname.startsWith('/backoffice');

  return (
    <>
      <ScrollToTop />
      {!isLoginPage && <Header />}
      <main className={isLoginPage ? '' : 'page-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/backoffice/*" element={<Backoffice />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AppLayout />
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
