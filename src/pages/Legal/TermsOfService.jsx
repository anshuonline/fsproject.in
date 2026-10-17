import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  const currentMonthYear = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <LegalLayout
      badge="USER AGREEMENT & POLICIES"
      title="Terms of Service | FreeSong.in"
      subtitle="Welcome to FreeSong.in. These Terms of Service constitute a legally binding agreement between you and FreeSong.in regarding your use of our Services."
    >
      <div className="fs-legal-section">
        <h2>Terms of Service</h2>
        <p>
          <strong>Effective Date:</strong> {currentMonthYear}<br />
          <strong>Last Updated:</strong> {currentMonthYear}
        </p>

        <p>
          Welcome to <strong>FreeSong.in</strong>. These Terms of Service ("Terms") constitute a legally binding agreement between you and FreeSong.in regarding your use of our Services. Please read these Terms carefully before using our Services.
        </p>
        <p>
          By accessing or using FreeSong.in's Services in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link to="/privacy">Privacy Policy</Link>, which is incorporated by reference into these Terms. If you do not agree to these Terms, please do not use our Services.
        </p>

        <h3>What These Terms Cover</h3>
        <p>
          These Terms apply to your access to and use of FreeSong.in's website, applications, and services (collectively, our "Services"). These Terms include important information about your legal rights, including limitations of liability, warranty disclaimers, and dispute resolution.
        </p>

        <h3>Description of Service</h3>
        <p>
          FreeSong.in is a music discovery and streaming platform that aggregates music content and public metadata from third-party media sources and providers. Our Services allow you to:
        </p>
        <ul className="feature-list">
          <li>Search and discover music content</li>
          <li>Stream music and audio content</li>
          <li>Create and manage playlists</li>
          <li>Save favorite songs</li>
          <li>Share music with friends</li>
          <li>Access music recommendations</li>
          <li>Use playlist and queue tools for personal listening</li>
        </ul>
        <p>
          FreeSong.in aggregates content and metadata from public third-party services. Specifically, we utilize:
        </p>
        <ul className="feature-list">
          <li>Public third-party music providers and metadata databases for music search, cataloging, and discovery functionality</li>
          <li>Third-party web streaming providers for audio and media content playback</li>
        </ul>
        <p>
          We do not host, store, upload, or own the media content accessible through our Services. All content is dynamically indexed from third-party sources, and we act solely as a search and discovery platform.
        </p>
        <p>
          <strong>Important Notice:</strong> We are not affiliated with, endorsed by, or officially partnered with any commercial music platform or recording label. We index publicly available web content for discovery and educational purposes only.
        </p>

        <h3>Third-Party Services and Content Providers</h3>
        <p>
          Our Services rely on third-party infrastructure and providers to deliver music information, metadata, search results, and media playback. These include:
        </p>
        <ul className="feature-list">
          <li><strong>Music Information Services:</strong> We use third-party data providers for search indexing, song metadata, album art, and artist biographies. We do not own this data and act strictly as an indexer.</li>
          <li><strong>Public Media Sources:</strong> Media streaming is delivered through third-party public web sources. Your interaction with third-party content through our Services remains subject to the respective terms and conditions of those third-party providers.</li>
          <li><strong>Authentication Services:</strong> We offer secure user authentication for personal library management.</li>
          <li><strong>Cloud Infrastructure:</strong> We utilize standard cloud hosting and storage for application delivery and user preference synchronization.</li>
        </ul>
        <p>
          We aggregate and present content from these third-party sources, but we do not claim ownership of the content. All music, audio, video, artwork, and related content remain the property of their respective copyright holders.
        </p>
        <p>
          Your use of third-party content through our Services is subject to the terms and policies of those respective third-party providers. We are not responsible for the availability, accuracy, or legality of content hosted on external networks.
        </p>
        <p>
          <strong>Third-Party Notice:</strong> Content availability depends on external networks and source providers. These services may change, update, or discontinue access at any time without prior notice.
        </p>

        <h3>Acceptable Use</h3>
        <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul className="feature-list">
          <li>Use our Services to infringe upon any intellectual property rights, including copyright, trademark, or patent rights</li>
          <li>Reproduce, distribute, or publicly perform copyrighted content without proper authorization from the rights holders</li>
          <li>Use automated systems (bots, scrapers) to access our Services in a manner that could harm or overload our systems</li>
          <li>Attempt to reverse engineer, decompile, or disassemble our Services</li>
          <li>Use our Services to transmit any malicious code, viruses, or harmful content</li>
          <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
          <li>Violate any applicable local, state, national, or international law or regulation</li>
        </ul>

        <h3>Copyright and Intellectual Property</h3>
        <h4>Content Ownership</h4>
        <p>
          All music, audio, video, artwork, and related content accessible through our Services are the property of their respective copyright owners. FreeSong.in does not claim ownership of any copyrighted content. We act solely as an aggregator and search platform.
        </p>

        <h4>Respect for Copyright</h4>
        <p>
          FreeSong.in respects intellectual property rights. We aggregate and provide access to content from third-party sources for informational and discovery purposes only. Users are responsible for ensuring their use of content complies with applicable copyright laws.
        </p>
        <p>
          You agree that you will only stream, download, or otherwise access content through our Services in a manner that respects the rights of copyright holders and complies with applicable laws.
        </p>

        <h4>DMCA Takedown Policy</h4>
        <p>
          If you believe that content accessible through our Services infringes your copyright, you may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing:
        </p>
        <ul className="feature-list">
          <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner</li>
          <li>Identification of the copyrighted work claimed to have been infringed</li>
          <li>Identification of the material claimed to be infringing and information reasonably sufficient to permit us to locate the material</li>
          <li>Your contact information</li>
          <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
          <li>A statement that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
        </ul>
        <p>
          Please send DMCA notifications to: <a href="mailto:support@freesong.in">support@freesong.in</a>
        </p>
        <p>
          Upon receipt of a valid DMCA notification, we will promptly investigate and, if appropriate, remove or disable access to the allegedly infringing content. We reserve the right to terminate accounts of users who are repeat infringers.
        </p>

        <h3>Compliance and Service Termination</h3>
        <p>
          FreeSong.in is committed to respecting intellectual property rights and copyright laws. We operate in good faith as a content aggregation platform and do not intend to infringe upon any copyrights.
        </p>
        <ul className="feature-list">
          <li>
            <strong>Commitment to Compliance:</strong> If we receive a formal warning, cease and desist notice, or legal notice from any copyright owner, authorized rights holder, or content provider regarding indexed content, we are committed to taking immediate action. This may include:
            <ul style={{ marginTop: '8px' }}>
              <li>Immediately disabling or removing the affected content or links within 24 hours of receiving notice</li>
              <li>Ceasing access to the disputed content source</li>
              <li>Temporarily suspending or permanently terminating our Services if required</li>
              <li>Cooperating fully with copyright holders to resolve any concerns</li>
              <li>Providing written confirmation of compliance actions taken</li>
            </ul>
          </li>
          <li>
            <strong>Response Timeline:</strong> We commit to responding to any legal notice, cease and desist letter, or takedown request within 24 hours of receipt. We will take corrective action immediately and provide confirmation of compliance within 48 hours.
          </li>
          <li>
            <strong>Good Faith Operation:</strong> FreeSong.in operates as an educational music discovery platform without intent to cause harm to content owners or service providers. We acknowledge that:
            <ul style={{ marginTop: '8px' }}>
              <li>We do not claim any ownership of the media accessible through our platform</li>
              <li>We respect the policies and terms of all external service providers</li>
              <li>We are prepared to immediately remove content or cease operations if notified that any activity infringes upon legitimate rights</li>
              <li>We will not contest or delay compliance with verified takedown requests</li>
              <li>We maintain no backup systems or mirrors to circumvent takedown actions</li>
            </ul>
          </li>
        </ul>
        <p>
          We operate in good faith and are committed to complying promptly with any legitimate requests from content owners, creators, or authorized representatives. Our goal is to promote music discovery while rigorously respecting intellectual property rights.
        </p>

        <div className="contact-card">
          <h4>Priority Contact for Rights Holders</h4>
          <p>
            If you are a copyright owner, legal representative, or official representative of any recording label, artist, or content provider and believe our Services are infringing upon your rights or conflicting with your distribution terms, please contact us immediately at <a href="mailto:support@freesong.in">support@freesong.in</a> with <strong>"URGENT: Legal Notice"</strong> in the subject line. We will respond within 24 hours and take immediate corrective action.
          </p>
        </div>

        <h3>Monitoring and Compliance Measures</h3>
        <ul className="feature-list">
          <li><strong>Active Monitoring:</strong> We actively monitor our contact channels for any legal notices, complaints, or requests from copyright holders. We maintain dedicated systems to ensure prompt detection and response to any compliance-related communications.</li>
          <li><strong>No Commercial Exploitation:</strong> FreeSong.in operates without directly monetizing copyrighted content. We do not charge users for access to music, and we do not generate revenue from the distribution of copyrighted materials. Our service exists purely as a discovery and aggregation platform.</li>
          <li><strong>Voluntary Compliance:</strong> Even in the absence of formal legal action, if we become aware that our use of any content source is causing concern, conflicting with provider terms, or otherwise problematic, we reserve the right to voluntarily discontinue that functionality or suspend the relevant features entirely.</li>
          <li><strong>No Intent to Circumvent:</strong> We explicitly state that we have no intention to circumvent technological protection measures, bypass paywalls, or violate digital rights management (DRM) systems. Our Services rely strictly on publicly accessible web sources and do not attempt to bypass security measures.</li>
          <li><strong>Transparent Attribution:</strong> We provide clear attribution to content sources and artists wherever possible, including links to official platforms where users can access content through legitimate channels. We encourage users to support artists and content creators through official platforms.</li>
        </ul>

        <h3>User Content and Accounts</h3>
        <ul className="feature-list">
          <li><strong>User-Generated Content:</strong> You may create playlists, save favorites, and share music through our Services. You retain ownership of any content you create, but by using our Services, you grant us a license to store, display, and process your user-generated content to provide our Services.</li>
          <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</li>
          <li><strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at any time, with or without cause or notice, if you violate these Terms or engage in any activity that we determine is harmful to our Services or other users.</li>
        </ul>

        <h3>Disclaimers and Limitations</h3>
        <ul className="feature-list">
          <li><strong>Service Availability:</strong> Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our Services will be uninterrupted, secure, error-free, or free from viruses or harmful components.</li>
          <li><strong>Content Accuracy:</strong> While we strive to provide accurate music metadata and content, we do not guarantee the accuracy, completeness, or reliability of any content accessible through our Services. Content is aggregated from third-party sources and may contain errors or inaccuracies.</li>
          <li><strong>Limitation of Liability:</strong> To the maximum extent permitted by law, FreeSong.in and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of our Services.</li>
          <li><strong>Indemnification:</strong> You agree to indemnify, defend, and hold harmless FreeSong.in and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney's fees) arising out of or relating to: your use of our Services, your violation of these Terms, your violation of any rights of any third party, or any content you submit, post, or transmit through our Services.</li>
        </ul>

        <h3>Third-Party Links and Services</h3>
        <p>
          Our Services may contain links to third-party websites or services that are not owned or controlled by FreeSong.in. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
        </p>
        <p>
          You acknowledge and agree that FreeSong.in shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
        </p>

        <h3>Modifications to Terms</h3>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Effective date" at the top of this Terms of Service.
        </p>
        <p>
          Your continued use of our Services after any changes to these Terms constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must discontinue your use of our Services.
        </p>

        <h3>Termination</h3>
        <p>
          We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
        </p>
        <p>
          Upon termination, your right to use our Services will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>

        <h3>Commitment to Legal Compliance & Safe Harbor</h3>
        <ul className="feature-list">
          <li>
            <strong>Transparent Operation:</strong> We operate transparently and disclose that:
            <ul style={{ marginTop: '8px' }}>
              <li>We rely on external web data and indexing services for music cataloging</li>
              <li>Content availability may change or be modified by source providers at any time</li>
              <li>We respect the intellectual property rights and distribution terms of all rights holders</li>
              <li>We are prepared to modify or cease operations if required for compliance reasons</li>
            </ul>
          </li>
          <li>
            <strong>Immediate Cessation Commitment:</strong> Upon receiving any form of legal notice, DMCA notice, or formal inquiry from copyright owners, their representatives, legal authorities, or rights management organizations, we commit to immediately (within 24 hours):
            <ul style={{ marginTop: '8px' }}>
              <li>Acknowledge receipt of the communication</li>
              <li>Disable the specific index entry, link, or functionality in question</li>
              <li>Suspend the entire service if required by legal authorities</li>
              <li>Provide written confirmation of actions taken</li>
              <li>Cooperate fully with verified rights holders to resolve any issues</li>
            </ul>
          </li>
          <li><strong>No Resistance to Takedown:</strong> We will not challenge, delay, or resist legitimate takedown requests. We will not attempt to circumvent takedown actions through mirrors or alternative indexing.</li>
          <li><strong>Non-Commercial Platform Operation:</strong> As we operate without charging users or directly monetizing copyrighted recordings, we maintain a non-commercial, good faith operation dedicated to music discovery.</li>
        </ul>

        <h3>Governing Law and Dispute Resolution</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FreeSong.in operates, without regard to its conflict of law provisions.
        </p>
        <p>
          Any disputes arising out of or relating to these Terms or our Services shall be resolved through good faith negotiations. If such negotiations are unsuccessful, disputes shall be resolved through binding arbitration or in the appropriate courts of jurisdiction.
        </p>
        <p>
          <strong>Priority Resolution for Copyright Holders:</strong> For any inquiries or concerns related to copyright or intellectual property, we commit to resolving issues swiftly and without litigation. We prioritize immediate compliance and amicable resolution above all else.
        </p>

        <h3>Contact Us</h3>
        <p>If you have any questions about these Terms of Service, please contact us:</p>
        <div className="contact-card">
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p><strong>Website:</strong> <a href="https://freesong.in">https://freesong.in</a></p>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          By using FreeSong.in, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use our Services.
        </p>
      </div>
    </LegalLayout>
  );
}
