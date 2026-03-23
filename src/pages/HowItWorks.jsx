import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CAPACITY_STATS = [
  { valueKey: 'howPage.capacity1Value', labelKey: 'howPage.capacity1Label' },
  { valueKey: 'howPage.capacity2Value', labelKey: 'howPage.capacity2Label' },
  { valueKey: 'howPage.capacity3Value', labelKey: 'howPage.capacity3Label' },
];

const WE_DO_KEYS = ['howPage.weDo1', 'howPage.weDo2', 'howPage.weDo3', 'howPage.weDo4'];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function StepSection({ number, titleKey, subtitleKey, textKey, details, reverse, bg }) {
  const { t } = useLanguage();
  const { ref, visible } = useInView();
  return (
    <section className={`py-5 ${bg ? 'bg-light' : ''}`}>
      <div className="container">
        <div
          ref={ref}
          className={`row align-items-center g-5 ${reverse ? 'flex-row-reverse' : ''} step-animate ${visible ? 'step-visible' : ''}`}
        >
          <div className={`col-lg-6 step-slide ${reverse ? 'step-slide-right' : 'step-slide-left'}`}>
            <div className="step-number mb-3">{number}</div>
            <h2 className="fw-bold mb-2">{t(titleKey)}</h2>
            <p className="text-muted fs-5 mb-3">{t(subtitleKey)}</p>
            <p className="text-muted">{t(textKey)}</p>
          </div>
          <div className={`col-lg-6 step-slide ${reverse ? 'step-slide-left' : 'step-slide-right'}`}>
            <ul className="how-details-list">
              {details.map((d) => <li key={d}>{t(d)}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapacityStat({ value, label }) {
  return (
    <div className="col-md-4 text-center">
      <div className="card border-0 shadow-sm p-4 h-100">
        <div className="stat-value">{value}</div>
        <p className="text-muted mb-0 mt-2">{label}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('seo.howItWorks.title')}</title>
        <meta name="description" content={t('seo.howItWorks.description')} />
        <meta property="og:title" content={t('seo.howItWorks.title')} />
        <meta property="og:description" content={t('seo.howItWorks.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
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

      {/* Pasos */}
      <StepSection
        number={1}
        titleKey="howPage.step1Title"
        subtitleKey="howPage.step1Subtitle"
        textKey="howPage.step1Text"
        details={['howPage.step1Detail1', 'howPage.step1Detail2', 'howPage.step1Detail3']}
        bg
      />
      <StepSection
        number={2}
        titleKey="howPage.step2Title"
        subtitleKey="howPage.step2Subtitle"
        textKey="howPage.step2Text"
        details={['howPage.step2Detail1', 'howPage.step2Detail2', 'howPage.step2Detail3']}
        reverse
      />
      <StepSection
        number={3}
        titleKey="howPage.step3Title"
        subtitleKey="howPage.step3Subtitle"
        textKey="howPage.step3Text"
        details={['howPage.step3Detail1', 'howPage.step3Detail2', 'howPage.step3Detail3']}
        bg
      />

      {/* Capacidad */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('howPage.capacityTitle')}</h2>
          <div className="row g-4 justify-content-center">
            {CAPACITY_STATS.map((s) => (
              <CapacityStat key={s.valueKey} value={t(s.valueKey)} label={t(s.labelKey)} />
            ))}
          </div>
        </div>
      </section>

      {/* Qué hacemos nosotros */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold text-center mb-3">{t('howPage.weDoTitle')}</h2>
              <p className="text-muted text-center mb-4">{t('howPage.weDoText')}</p>
              <ul className="how-details-list">
                {WE_DO_KEYS.map((k) => <li key={k}>{t(k)}</li>)}
              </ul>
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
