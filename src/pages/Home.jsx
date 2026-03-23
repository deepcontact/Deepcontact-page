import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

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

const FEATURES = [
  { emoji: '🤖', titleKey: 'home.feature1Title', descKey: 'home.feature1Desc' },
  { emoji: '⚙️', titleKey: 'home.feature2Title', descKey: 'home.feature2Desc' },
  { emoji: '📈', titleKey: 'home.feature3Title', descKey: 'home.feature3Desc' },
  { emoji: '📊', titleKey: 'home.feature4Title', descKey: 'home.feature4Desc' },
];

const STEPS = [
  { n: 1, titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
  { n: 2, titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
  { n: 3, titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
];

const STATS = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
];

function FeatureCard({ emoji, title, desc, delay }) {
  const { ref, visible } = useInView();
  return (
    <div className="col-md-6 col-lg-3">
      <div
        ref={ref}
        className="card h-100 border-0 shadow-sm text-center p-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        }}
      >
        <div className="mb-3"><span className="fs-1">{emoji}</span></div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-0">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ n, title, desc, delay }) {
  const { ref, visible } = useInView();
  return (
    <div className="col-md-4">
      <div
        ref={ref}
        className="text-center p-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        }}
      >
        <div className="step-number mb-3">{n}</div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-0">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label, delay }) {
  const { ref, visible } = useInView();
  return (
    <div className="col-md-4 text-center">
      <div
        ref={ref}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        }}
      >
        <div className="stat-value">{value}</div>
        <p className="text-muted fw-semibold mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { ref: heroRef, visible: heroVisible } = useInView(0.05);

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta property="og:title" content={t('seo.home.title')} />
        <meta property="og:description" content={t('seo.home.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
      </Helmet>

      {/* Hero */}
      <section className="hero-section text-white text-center d-flex align-items-center">
        <div className="container">
          <div
            ref={heroRef}
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <h1 className="display-3 fw-bold mb-4">{t('home.heroTitle')}</h1>
            <p className="lead mb-5 mx-auto" style={{ maxWidth: '700px' }}>
              {t('home.heroSubtitle')}
            </p>
            <Link to="/contacto" className="btn btn-light btn-lg px-5 fw-semibold">
              {t('home.heroCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('home.featuresTitle')}</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              {t('home.featuresSubtitle')}
            </p>
          </div>
          <div className="row g-4">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.titleKey}
                emoji={f.emoji}
                title={t(f.titleKey)}
                desc={t(f.descKey)}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('home.statsTitle')}</h2>
          <div className="row g-4 justify-content-center">
            {STATS.map((s, i) => (
              <StatCard
                key={s.valueKey}
                value={t(s.valueKey)}
                label={t(s.labelKey)}
                delay={i * 120}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('home.howTitle')}</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              {t('home.howSubtitle')}
            </p>
          </div>
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <StepCard
                key={s.titleKey}
                n={s.n}
                title={t(s.titleKey)}
                desc={t(s.descKey)}
                delay={i * 130}
              />
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/como-funciona" className="btn btn-dark btn-lg px-5 fw-semibold">
              {t('home.howCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
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
