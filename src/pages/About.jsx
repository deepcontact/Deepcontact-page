import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import scImg from '../assets/images/SC.png';
import tbImg from '../assets/images/tb.jfif';
import pgImg from '../assets/images/pg.png';

const VALUES = [
  { emoji: '🔁', titleKey: 'about.value1Title', descKey: 'about.value1Desc' },
  { emoji: '⚙️', titleKey: 'about.value2Title', descKey: 'about.value2Desc' },
  { emoji: '📉', titleKey: 'about.value3Title', descKey: 'about.value3Desc' },
];

const TEAM = [
  { img: scImg, nameKey: 'about.member1Name', roleKey: 'about.member1Role' },
  { img: tbImg, nameKey: 'about.member2Name', roleKey: 'about.member2Role' },
  { img: pgImg, nameKey: 'about.member3Name', roleKey: 'about.member3Role' },
];

function ValueCard({ emoji, title, desc }) {
  return (
    <div className="col-md-4">
      <div className="card h-100 border-0 shadow-sm p-5 text-center">
        <div className="mb-4"><span className="fs-1">{emoji}</span></div>
        <h5 className="fw-bold mb-3">{title}</h5>
        <p className="text-muted mb-0 lh-lg">{desc}</p>
      </div>
    </div>
  );
}

function TeamMember({ img, name, role }) {
  return (
    <div className="col-6 col-md-3 text-center">
      <img src={img} alt={name} className="team-avatar mb-3" />
      <h6 className="fw-bold mb-1">{name}</h6>
      <small className="text-muted">{role}</small>
    </div>
  );
}

export default function About() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('seo.about.title')}</title>
        <meta name="description" content={t('seo.about.description')} />
        <meta property="og:title" content={t('seo.about.title')} />
        <meta property="og:description" content={t('seo.about.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
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

      {/* Misión & Visión */}
      <section className="py-5 py-lg-6">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-md-6">
              <h2 className="fw-bold mb-4">{t('about.missionTitle')}</h2>
              <p className="text-muted fs-5 lh-lg">{t('about.missionText')}</p>
            </div>
            <div className="col-md-6">
              <h2 className="fw-bold mb-4">{t('about.visionTitle')}</h2>
              <p className="text-muted fs-5 lh-lg">{t('about.visionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-5 py-lg-6 bg-light">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('about.valuesTitle')}</h2>
          <div className="row g-4 justify-content-center">
            {VALUES.map((v) => (
              <ValueCard
                key={v.titleKey}
                emoji={v.emoji}
                title={t(v.titleKey)}
                desc={t(v.descKey)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{t('about.teamTitle')}</h2>
            <p className="text-muted">{t('about.teamSubtitle')}</p>
          </div>
          <div className="row g-4 justify-content-center">
            {TEAM.map((m) => (
              <TeamMember
                key={m.nameKey}
                img={m.img}
                name={t(m.nameKey)}
                role={t(m.roleKey)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
