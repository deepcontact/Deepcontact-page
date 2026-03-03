import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import scImg from '../assets/images/SC.png';
import tbImg from '../assets/images/tb.jfif';
import pgImg from '../assets/images/pg.png';

function About() {
  const { t } = useLanguage();
  const pageTitle = t('seo.about.title');
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);

  return (
    <>
      <Helmet>
        <title>{t('seo.about.title')}</title>
        <meta name="description" content={t('seo.about.description')} />
        <meta property="og:title" content={t('seo.about.title')} />
        <meta property="og:description" content={t('seo.about.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
        <meta property="og:url" content="https://deepcontact.com/about" />
      </Helmet>

      {/* Hero */}
      <section className="about-hero text-white text-center d-flex align-items-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">{t('about.heroTitle')}</h1>
          <p className="lead mx-auto" style={{ maxWidth: '650px' }}>
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-md-6">
              <h2 className="fw-bold mb-3">{t('about.missionTitle')}</h2>
              <p className="text-muted">{t('about.missionText')}</p>
            </div>
            <div className="col-md-6">
              <h2 className="fw-bold mb-3">{t('about.visionTitle')}</h2>
              <p className="text-muted">{t('about.visionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-4">{t('about.storyTitle')}</h2>
              <p className="text-muted fs-5">{t('about.storyText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('about.valuesTitle')}</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">💡</span></div>
                <h5 className="fw-bold">{t('about.value1Title')}</h5>
                <p className="text-muted mb-0">{t('about.value1Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">💙</span></div>
                <h5 className="fw-bold">{t('about.value2Title')}</h5>
                <p className="text-muted mb-0">{t('about.value2Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">🔍</span></div>
                <h5 className="fw-bold">{t('about.value3Title')}</h5>
                <p className="text-muted mb-0">{t('about.value3Desc')}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="mb-3"><span className="fs-1">🏆</span></div>
                <h5 className="fw-bold">{t('about.value4Title')}</h5>
                <p className="text-muted mb-0">{t('about.value4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('about.teamTitle')}</h2>
            <p className="text-muted">{t('about.teamSubtitle')}</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-6 col-md-3">
              <div className="text-center">
                <img src={scImg} alt="Santiago Collinet" className="team-avatar mb-3" />
                <h6 className="fw-bold mb-1">{t('about.member1Name')}</h6>
                <small className="text-muted">{t('about.member1Role')}</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <img src={tbImg} alt="Tobias Maidana" className="team-avatar mb-3" />
                <h6 className="fw-bold mb-1">{t('about.member2Name')}</h6>
                <small className="text-muted">{t('about.member2Role')}</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <img src={pgImg} alt="Pablo Guerra" className="team-avatar mb-3" />
                <h6 className="fw-bold mb-1">{t('about.member3Name')}</h6>
                <small className="text-muted">{t('about.member3Role')}</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
