import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

function Home() {
  const { t } = useLanguage();
  const pageTitle = t('seo.home.title');
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta property="og:title" content={t('seo.home.title')} />
        <meta property="og:description" content={t('seo.home.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
        <meta property="og:url" content="https://deepcontact.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section text-white text-center d-flex align-items-center">
        <div className="container">
          <h1 className="display-3 fw-bold mb-4">{t('home.heroTitle')}</h1>
          <p className="lead mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            {t('home.heroSubtitle')}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/contacto" className="btn btn-light btn-lg px-4 fw-semibold">
              {t('home.heroCta')}
            </Link>
            <button className="btn btn-outline-light btn-lg px-4">
              {t('home.heroSecondaryCta')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('home.featuresTitle')}</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              {t('home.featuresSubtitle')}
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <span className="fs-1">🗣️</span>
                </div>
                <h5 className="fw-bold">{t('home.feature1Title')}</h5>
                <p className="text-muted">{t('home.feature1Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <span className="fs-1">⏰</span>
                </div>
                <h5 className="fw-bold">{t('home.feature2Title')}</h5>
                <p className="text-muted">{t('home.feature2Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <span className="fs-1">🌍</span>
                </div>
                <h5 className="fw-bold">{t('home.feature3Title')}</h5>
                <p className="text-muted">{t('home.feature3Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <span className="fs-1">📊</span>
                </div>
                <h5 className="fw-bold">{t('home.feature4Title')}</h5>
                <p className="text-muted">{t('home.feature4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('home.howTitle')}</h2>
            <p className="text-muted">{t('home.howSubtitle')}</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center p-4">
                <div className="step-number mb-3">1</div>
                <h5 className="fw-bold">{t('home.step1Title')}</h5>
                <p className="text-muted">{t('home.step1Desc')}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-4">
                <div className="step-number mb-3">2</div>
                <h5 className="fw-bold">{t('home.step2Title')}</h5>
                <p className="text-muted">{t('home.step2Desc')}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-4">
                <div className="step-number mb-3">3</div>
                <h5 className="fw-bold">{t('home.step3Title')}</h5>
                <p className="text-muted">{t('home.step3Desc')}</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/como-funciona" className="btn btn-dark btn-lg px-4 fw-semibold">
              {t('home.howCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section text-white text-center py-5">
        <div className="container">
          <h2 className="fw-bold mb-3">{t('home.ctaTitle')}</h2>
          <p className="mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            {t('home.ctaDesc')}
          </p>
          <Link to="/contacto" className="btn btn-light btn-lg px-5 fw-semibold">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
