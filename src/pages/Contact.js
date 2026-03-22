import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

function Contact() {
  const { t } = useLanguage();
  const pageTitle = t('seo.contact.title');
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);
  const [faqOpen, setFaqOpen] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9+\-\s()]/g, '');
      setFormData({ ...formData, phone: cleaned });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setError(t('contact.invalidEmailMessage'));
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    const { error: insertError } = await supabase.from('contactUs').insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        source: 'website',
      },
    ]);

    setLoading(false);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      setError(t('contact.errorMessage'));
    } else {
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('seo.contact.title')}</title>
        <meta name="description" content={t('seo.contact.description')} />
        <meta property="og:title" content={t('seo.contact.title')} />
        <meta property="og:description" content={t('seo.contact.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DeepContact" />
        <meta property="og:url" content="https://deepcontact.com/contacto" />
      </Helmet>

      {/* Hero */}
      <section className="contact-hero text-white text-center d-flex align-items-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">{t('contact.heroTitle')}</h1>
          <p className="lead mx-auto" style={{ maxWidth: '600px' }}>
            {t('contact.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            {/* Form */}
            <div className="col-lg-7">
              <h2 className="fw-bold mb-4">{t('contact.formTitle')}</h2>

              {success && (
                <div className="alert alert-success">{t('contact.successMessage')}</div>
              )}
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('contact.nameLabel')}</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-lg"
                      placeholder={t('contact.namePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('contact.emailLabel')}</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder={t('contact.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('contact.companyLabel')}</label>
                    <input
                      type="text"
                      name="company"
                      className="form-control form-control-lg"
                      placeholder={t('contact.companyPlaceholder')}
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('contact.phoneLabel')}</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-lg"
                      placeholder={t('contact.phonePlaceholder')}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">{t('contact.messageLabel')}</label>
                    <textarea
                      name="message"
                      className="form-control form-control-lg"
                      rows="5"
                      placeholder={t('contact.messagePlaceholder')}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5 contact-submit-btn"
                      disabled={loading}
                    >
                      {loading ? t('contact.sendingButton') : t('contact.submitButton')}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Info sidebar */}
            <div className="col-lg-5">
              <div className="contact-info-card p-4 rounded-3 mb-4">
                <h5 className="fw-bold mb-4">{t('contact.infoTitle')}</h5>
                <div className="d-flex align-items-start mb-3">
                  <span className="contact-icon me-3">📧</span>
                  <div>
                    <div className="fw-semibold">{t('contact.emailLabel')}</div>
                    <div className="text-muted">{t('contact.emailInfo')}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <span className="contact-icon me-3">📞</span>
                  <div>
                    <a
                      href="https://wa.me/5491164090482"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fw-semibold text-decoration-none text-dark"
                    >
                      {t('contact.phoneInfo')}
                    </a>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <span className="contact-icon me-3">📍</span>
                  <div>
                    <div className="fw-semibold">{t('contact.locationInfo')}</div>
                  </div>
                </div>
                <hr />
                <h6 className="fw-bold mb-2">{t('contact.scheduleTitle')}</h6>
                <p className="text-muted mb-0">{t('contact.scheduleInfo')}</p>
              </div>

              <div className="contact-info-card p-4 rounded-3">
                <h6 className="fw-bold mb-3">{t('contact.socialTitle')}</h6>
                <div className="d-flex gap-3">
                  <span className="social-icon">in</span>
                  <span className="social-icon">𝕏</span>
                  <span className="social-icon">ig</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('contact.faqTitle')}</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {[1, 2, 3].map((i) => (
                <div className="faq-item mb-3" key={i}>
                  <button
                    className={`faq-question ${faqOpen === i ? 'active' : ''}`}
                    onClick={() => toggleFaq(i)}
                  >
                    <span>{t(`contact.faq${i}Question`)}</span>
                    <span className="faq-arrow">{faqOpen === i ? '−' : '+'}</span>
                  </button>
                  {faqOpen === i && (
                    <div className="faq-answer">
                      <p className="mb-0">{t(`contact.faq${i}Answer`)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
