import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { Mail, MessageSquare, ShieldAlert, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ContextMenuContext';

export function ContactUs() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'support',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Thank you! Your message has been received.', 'success');
      setFormData({
        name: '',
        email: '',
        category: 'support',
        subject: '',
        message: ''
      });
    }, 800);
  };

  return (
    <LegalLayout
      badge="GET IN TOUCH"
      title="Contact Us & Support Helpdesk"
      subtitle="Have questions, suggestions, feedback, or DMCA inquiries? Reach out to the FreeSong.in team. We are here to help."
    >
      <div className="fs-legal-section">
        <h2>Direct Email Channels</h2>
        <p>
          For the fastest response, reach out to the appropriate department directly:
        </p>

        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} color="var(--color-primary)" />
              User Support & Feedback
            </span>
            <span className="fs-legal-card-desc">
              Questions regarding audio streaming, features, playlists, and bug reports.
            </span>
            <a href="mailto:support@freesong.in" className="fs-legal-card-link">
              support@freesong.in
            </a>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="var(--color-primary)" />
              DMCA & Legal Desk
            </span>
            <span className="fs-legal-card-desc">
              Official copyright notices, takedown requests, and regulatory compliance.
            </span>
            <a href="mailto:dmca@freesong.in" className="fs-legal-card-link">
              dmca@freesong.in
            </a>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="var(--color-primary)" />
              Business & Partnerships
            </span>
            <span className="fs-legal-card-desc">
              Advertising, business development, press inquiries, and artist collaborations.
            </span>
            <a href="mailto:business@freesong.in" className="fs-legal-card-link">
              business@freesong.in
            </a>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>Send Us a Message</h2>
        <p>
          Fill out the form below and our support team will respond within <strong>24 to 48 business hours</strong>.
        </p>

        <div className="fs-contact-form-card">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '36px 20px' }}>
              <CheckCircle2 size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: 8 }}>
                Message Dispatched Successfully!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: 440, margin: '0 auto 20px' }}>
                Thank you for contacting FreeSong.in. A confirmation has been logged and a support representative will follow up with you shortly.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fs-contact-form-grid">
                <div className="fs-form-group">
                  <label htmlFor="fs-name">Full Name *</label>
                  <input
                    id="fs-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="fs-form-input"
                    required
                  />
                </div>

                <div className="fs-form-group">
                  <label htmlFor="fs-email">Email Address *</label>
                  <input
                    id="fs-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="fs-form-input"
                    required
                  />
                </div>

                <div className="fs-form-group">
                  <label htmlFor="fs-category">Department / Topic *</label>
                  <select
                    id="fs-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="fs-form-select"
                  >
                    <option value="support">General Support & Player Issues</option>
                    <option value="feature">Feature Request or Suggestion</option>
                    <option value="dmca">DMCA / Copyright Notice</option>
                    <option value="business">Business / Advertising Inquiries</option>
                    <option value="other">Other Inquiries</option>
                  </select>
                </div>

                <div className="fs-form-group">
                  <label htmlFor="fs-subject">Subject</label>
                  <input
                    id="fs-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief subject summary"
                    className="fs-form-input"
                  />
                </div>

                <div className="fs-form-group full-width">
                  <label htmlFor="fs-message">Your Message *</label>
                  <textarea
                    id="fs-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details about your question, feedback, or inquiry..."
                    className="fs-form-textarea"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <Clock size={14} />
                  <span>Typical response time: Under 24 hours</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </LegalLayout>
  );
}
