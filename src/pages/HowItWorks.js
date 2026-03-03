import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

function HowItWorks() {
  const { t } = useLanguage();
  const pageTitle = t('seo.howItWorks.title');
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);

  return (
    <>
      <Helmet>
        <title>{t('seo.howItWorks.title')}</title>
        <meta name="description" content={t('seo.howItWorks.description')} />
        <meta property="og:title" content={t('seo.howItWorks.title')} />
        <meta property="og:description" content={t('seo.howItWorks.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
        <meta property="og:url" content="https://deepcontact.com/como-funciona" />
      </Helmet>

      {/* Hero */}
      <section className="how-hero text-white text-center d-flex align-items-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">{t('howPage.heroTitle')}</h1>
          <p className="lead mx-auto" style={{ maxWidth: '650px' }}>
            {t('howPage.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-4">{t('howPage.overviewTitle')}</h2>
              <p className="text-muted fs-5">{t('howPage.overviewText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="step-number mb-3">1</div>
              <h2 className="fw-bold">{t('howPage.step1Title')}</h2>
              <p className="text-muted fs-5 mb-2">{t('howPage.step1Subtitle')}</p>
              <p className="text-muted">{t('howPage.step1Text')}</p>
            </div>
            <div className="col-lg-6">
              <ul className="how-details-list">
                <li>{t('howPage.step1Detail1')}</li>
                <li>{t('howPage.step1Detail2')}</li>
                <li>{t('howPage.step1Detail3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 order-lg-2">
              <div className="step-number mb-3">2</div>
              <h2 className="fw-bold">{t('howPage.step2Title')}</h2>
              <p className="text-muted fs-5 mb-2">{t('howPage.step2Subtitle')}</p>
              <p className="text-muted">{t('howPage.step2Text')}</p>
            </div>
            <div className="col-lg-6 order-lg-1">
              <ul className="how-details-list">
                <li>{t('howPage.step2Detail1')}</li>
                <li>{t('howPage.step2Detail2')}</li>
                <li>{t('howPage.step2Detail3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="step-number mb-3">3</div>
              <h2 className="fw-bold">{t('howPage.step3Title')}</h2>
              <p className="text-muted fs-5 mb-2">{t('howPage.step3Subtitle')}</p>
              <p className="text-muted">{t('howPage.step3Text')}</p>
            </div>
            <div className="col-lg-6">
              <ul className="how-details-list">
                <li>{t('howPage.step3Detail1')}</li>
                <li>{t('howPage.step3Detail2')}</li>
                <li>{t('howPage.step3Detail3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('howPage.techTitle')}</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">🧠</span></div>
                <h5 className="fw-bold">{t('howPage.tech1Title')}</h5>
                <p className="text-muted mb-0">{t('howPage.tech1Desc')}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">🔄</span></div>
                <h5 className="fw-bold">{t('howPage.tech2Title')}</h5>
                <p className="text-muted mb-0">{t('howPage.tech2Desc')}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">☁️</span></div>
                <h5 className="fw-bold">{t('howPage.tech3Title')}</h5>
                <p className="text-muted mb-0">{t('howPage.tech3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section text-white text-center py-5">
        <div className="container">
          <h2 className="fw-bold mb-3">{t('howPage.ctaTitle')}</h2>
          <p className="mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            {t('howPage.ctaDesc')}
          </p>
          <Link to="/contacto" className="btn btn-light btn-lg px-5 fw-semibold">
            {t('howPage.ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}

export default HowItWorks;
