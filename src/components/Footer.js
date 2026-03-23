import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer-section text-white">
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand + description */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">DeepContact</h5>
            <p className="footer-text">{t('footer.description')}</p>
            <div className="d-flex gap-3 mt-3">
              <span className="footer-social">in</span>
              <span className="footer-social">𝕏</span>
              <span className="footer-social">ig</span>
            </div>
          </div>

          {/* Links */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">{t('footer.linksTitle')}</h6>
            <ul className="list-unstyled footer-links">
              <li><NavLink to="/">{t('nav.home')}</NavLink></li>
              <li><NavLink to="/about">{t('nav.about')}</NavLink></li>
              <li><NavLink to="/contacto">{t('nav.contact')}</NavLink></li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">{t('footer.contactTitle')}</h6>
            <ul className="list-unstyled footer-text">
              <li className="mb-2">📧 {t('contact.emailInfo')}</li>
              <li className="mb-2">📞 <a href="https://wa.me/5491164090482" target="_blank" rel="noopener noreferrer" className="text-decoration-none footer-text">{t('contact.phoneInfo')}</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom py-3">
        <div className="container text-center">
          <small className="footer-text">&copy; {t('footer.copyright')}</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
