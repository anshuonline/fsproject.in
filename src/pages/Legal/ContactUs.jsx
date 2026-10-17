import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';
import { Send, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ContextMenuContext';

export function ContactUs() {
  const { showToast } = useToast();
  const currentYear = new Date().getFullYear();

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
      title="Contact FreeSong.in - Support & Inquiries"
      subtitle="At FreeSong.in, we value user feedback and aim to make every interaction with our platform as smooth as possible."
    >
      <div className="fs-legal-section">
        <h2>Contact FreeSong.in</h2>
        <p>
          At FreeSong.in, we value user feedback and aim to make every interaction with our platform as smooth as possible. Whether you need technical assistance, want to share an idea, report a problem, or discuss a potential partnership, our team welcomes your inquiry.
        </p>

        <div className="contact-card">
          <h3>Customer Support</h3>
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p style={{ marginTop: '8px' }}>
            For general questions, playback difficulties, website errors, account-related concerns, or assistance with available features, contact our support team. Please include relevant details about your device, browser, and the issue you encountered so we can better understand your request.
          </p>
        </div>

        <div className="contact-card">
          <h3>Business and Partnerships</h3>
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p style={{ marginTop: '8px' }}>
            We welcome professional inquiries concerning business collaborations, promotional opportunities, technology integrations, sponsorship proposals, and media-related requests. If you have a proposal that aligns with FreeSong.in and its audience, feel free to get in touch.
          </p>
        </div>

        <div className="contact-card">
          <h3>Copyright and Legal Matters</h3>
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p style={{ marginTop: '8px' }}>
            For copyright complaints, intellectual property concerns, trademark matters, or other legal inquiries, please contact us with a clear description of the issue and the relevant supporting information. Use a subject line such as “Copyright Notice” or “Legal Inquiry” to help identify the nature of your request.
          </p>
          <p style={{ marginTop: '8px' }}>
            Please review our <Link to="/dmca">DMCA Policy</Link> for applicable procedures and submission requirements.
          </p>
        </div>

        <h3>Suggestions and Feature Requests</h3>
        <p>
          We are interested in hearing how FreeSong.in can become more useful to its visitors. Share your suggestions, describe the problem you want to solve, and explain how your proposed improvement could enhance the overall experience.
        </p>
        <p>
          Our evaluation of suggestions may take into account user needs, technical feasibility, platform priorities, and potential benefits.
        </p>

        <h3>Report a Technical Problem</h3>
        <p>
          If you experience an error or unexpected behavior while using FreeSong.in, providing detailed information can help us investigate the issue more effectively.
        </p>
        <p>Where possible, include:</p>
        <ul className="feature-list">
          <li><strong>Browser details:</strong> Browser name and version.</li>
          <li><strong>Device information:</strong> Device model and operating system.</li>
          <li><strong>Steps to reproduce:</strong> The actions that led to the problem.</li>
          <li><strong>Expected and actual results:</strong> Explain what you wanted to happen and what occurred instead.</li>
          <li><strong>Supporting evidence:</strong> Screenshots or screen recordings, if available.</li>
        </ul>
        <p><em>Please avoid including passwords, verification codes, or other sensitive personal information in your report.</em></p>

        <h3>Send Us a Direct Message</h3>
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
                Thank you for contacting FreeSong.in. A confirmation has been logged and a support representative will follow up with you shortly at {formData.email || 'your email'}.
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
                    <option value="support">Customer Support & Player Issues</option>
                    <option value="feature">Suggestions & Feature Requests</option>
                    <option value="dmca">Copyright Notice / Legal Inquiry</option>
                    <option value="business">Business & Partnerships</option>
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

        <h3 style={{ marginTop: '36px' }}>Stay Connected</h3>
        <p>
          Keep an eye on our official communication channels for platform announcements, feature updates, music discovery discussions, and other community activities as they become available.
        </p>
        <p>
          For website-related questions or assistance, email us directly at <a href="mailto:support@freesong.in">support@freesong.in</a> or use the contact options provided on our platform.
        </p>

        <div className="contact-card" style={{ textAlign: 'center', marginTop: '24px' }}>
          <p><Link to="/" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Visit FreeSong.in</Link></p>
          <p style={{ marginTop: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
            FreeSong.in — Your destination for music discovery and listening.
          </p>
        </div>
        <p style={{ marginTop: '24px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          © {currentYear} FreeSong.in. All rights reserved.
        </p>
      </div>
    </LegalLayout>
  );
}
