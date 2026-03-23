import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function useInView(threshold = 0.12) {
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

const INCLUDED = [
  { icon: '🕐', titleKey: 'pricing.included1Title', descKey: 'pricing.included1Desc' },
  { icon: '🤖', titleKey: 'pricing.included2Title', descKey: 'pricing.included2Desc' },
  { icon: '📊', titleKey: 'pricing.included3Title', descKey: 'pricing.included3Desc' },
  { icon: '🛠️', titleKey: 'pricing.included4Title', descKey: 'pricing.included4Desc' },
];

const IMPL_ITEMS = [
  'pricing.impl1',
  'pricing.impl2',
  'pricing.impl3',
  'pricing.impl4',
];

const VOLUME_ROWS = [
  { rangeKey: 'pricing.range1', priceKey: 'pricing.price1' },
  { rangeKey: 'pricing.range2', priceKey: 'pricing.price2' },
  { rangeKey: 'pricing.range3', priceKey: 'pricing.price3' },
  { rangeKey: 'pricing.range4', priceKey: 'pricing.price4' },
  { rangeKey: 'pricing.range5', priceKey: 'pricing.price5' },
  { rangeKey: 'pricing.range6', priceKey: 'pricing.price6' },
  { rangeKey: 'pricing.range7', priceKey: 'pricing.price7' },
  { rangeKey: 'pricing.range8', priceKey: 'pricing.price8' },
];

const NOTES = ['pricing.note1', 'pricing.note2', 'pricing.note3'];

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('pricing.seoTitle')}</title>
        <meta name="description" content={t('pricing.seoDesc')} />
        <meta property="og:title" content={t('pricing.seoTitle')} />
        <meta property="og:description" content={t('pricing.seoDesc')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
      </Helmet>

      {/* Hero */}
      <section className="pricing-hero text-white text-center d-flex align-items-center">
        <div className="container">
          <div
            style={{
              opacity: 1,
              animation: 'pricingHeroIn 0.7s ease both',
            }}
          >
            <h1 className="display-4 fw-bold mb-3">{t('pricing.heroTitle')}</h1>
            <p className="lead mx-auto" style={{ maxWidth: '620px' }}>
              {t('pricing.heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Plan card */}
      <section className="py-5">
        <div className="container">
          <FadeIn>
            <div className="pricing-plan-card mx-auto">
              <div className="pricing-plan-header">
                <span className="pricing-badge">{t('pricing.planBadge')}</span>
                <div className="pricing-price mt-3">
                  <span className="pricing-amount">{t('pricing.planPrice')}</span>
                  <span className="pricing-period">{t('pricing.planPeriod')}</span>
                </div>
                <p className="pricing-plan-desc">{t('pricing.planDesc')}</p>
              </div>

              <div className="pricing-plan-body">
                <h5 className="fw-bold mb-4">{t('pricing.includedTitle')}</h5>
                <div className="row g-4">
                  {INCLUDED.map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="pricing-include-item">
                        <span className="pricing-include-icon">{item.icon}</span>
                        <div>
                          <div className="fw-semibold">{t(item.titleKey)}</div>
                          <div className="text-muted small mt-1">{t(item.descKey)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Implementation */}
      <section className="py-5 bg-light">
        <div className="container">
          <FadeIn>
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <div className="pricing-impl-card text-center text-lg-start p-5">
                  <span className="pricing-impl-badge">{t('pricing.implBadge')}</span>
                  <div className="pricing-impl-price mt-3">{t('pricing.implPrice')}</div>
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                    {t('pricing.implTitle')}
                  </p>
                </div>
              </div>
              <div className="col-lg-7">
                <h3 className="fw-bold mb-3">{t('pricing.implTitle')}</h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.75' }}>
                  {t('pricing.implDesc')}
                </p>
                <ul className="pricing-impl-list">
                  {IMPL_ITEMS.map((key, i) => (
                    <li key={i}>
                      <span className="pricing-check">✓</span>
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Volume pricing */}
      <section className="py-5">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-5">
              <h2 className="fw-bold">{t('pricing.extraTitle')}</h2>
              <p className="text-muted mx-auto mt-3" style={{ maxWidth: '680px', lineHeight: '1.75' }}>
                {t('pricing.extraDesc')}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="pricing-table-wrapper mx-auto">
              <table className="pricing-table w-100">
                <thead>
                  <tr>
                    <th>{t('pricing.tableRange')}</th>
                    <th>{t('pricing.tableCost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUME_ROWS.map((row, i) => (
                    <tr key={i} className={i === VOLUME_ROWS.length - 1 ? 'pricing-table-last' : ''}>
                      <td>{t(row.rangeKey)}</td>
                      <td className="fw-semibold">{t(row.priceKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Notes */}
      <section className="py-5 bg-light">
        <div className="container">
          <FadeIn>
            <div className="pricing-notes-card mx-auto">
              <h5 className="fw-bold mb-4">{t('pricing.notesTitle')}</h5>
              <ul className="pricing-notes-list">
                {NOTES.map((key, i) => (
                  <li key={i}>{t(key)}</li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section text-white text-center py-5">
        <div className="container">
          <FadeIn>
            <h2 className="fw-bold mb-3">{t('pricing.ctaTitle')}</h2>
            <p className="mb-4 mx-auto" style={{ maxWidth: '600px' }}>
              {t('pricing.ctaDesc')}
            </p>
            <Link to="/contacto" className="btn btn-light btn-lg px-5 fw-semibold">
              {t('pricing.ctaButton')}
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
