import nodemailer from 'nodemailer';
import { query } from './database/db.js';

let transporterInstance = null;

export function getTransporter() {
  const user = process.env.SMTP_USER || 'support@ganatube.in';
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'Ganatube1234@.com';

  if (!pass) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }
  return transporterInstance;
}

/**
 * Curated top artists for text-only recommendations (NO IMAGES, NO EMOJIS, NO ATIF ASLAM)
 * Includes Indian icons and Global English chart-toppers
 */
const RECOMMENDED_ARTISTS = [
  // Indian Chart Toppers
  { name: 'Arijit Singh', tag: 'Romantic & Melodies' },
  { name: 'Shreya Ghoshal', tag: 'Soulful Classics' },
  { name: 'Diljit Dosanjh', tag: 'Punjabi & Pop' },
  { name: 'Sidhu Moose Wala', tag: 'Punjabi Beats' },
  { name: 'A.R. Rahman', tag: 'Soundtracks & Classics' },
  { name: 'Anirudh Ravichander', tag: 'Trending Chartbusters' },
  // Global English Artists
  { name: 'The Weeknd', tag: 'Global Pop & R&B' },
  { name: 'Taylor Swift', tag: 'Pop & Singer-Songwriter' },
  { name: 'Ed Sheeran', tag: 'Acoustic & Pop' },
  { name: 'Drake', tag: 'Hip-Hop & Rap' },
  { name: 'Billie Eilish', tag: 'Alt-Pop & Electronic' },
  { name: 'Justin Bieber', tag: 'Global Hits' }
];

/**
 * Generate Ultra-Clean, Professional Spotify-Style Welcome Email HTML
 * - Palette: Pure Black #000000, Card Surface #121212 / #181818, Border #282828
 * - Primary Brand Green: #00C853, Hover: #00E676
 * - Text: Pure White #FFFFFF, Muted: #A7A7A7 / #727272
 * - Zero Emojis (Pure professional corporate music streaming design)
 */
export function generateWelcomeEmailHtml(userName, userEmail) {
  const safeName = (userName && userName !== 'FreeSong Listener' && userName !== 'Google User')
    ? userName.trim()
    : (userEmail ? userEmail.split('@')[0] : 'Music Lover');

  const appUrl = process.env.APP_URL || 'https://freesong.in';
  const logoUrl = `${appUrl}/images/freesonglogowebp.webp`;

  // Build clean text-based artist recommendation rows (NO IMAGES, NO EMOJIS)
  let artistRowsHtml = '';
  for (let i = 0; i < RECOMMENDED_ARTISTS.length; i += 2) {
    const a1 = RECOMMENDED_ARTISTS[i];
    const a2 = RECOMMENDED_ARTISTS[i + 1];

    artistRowsHtml += `
      <tr>
        <td width="50%" style="padding: 4px;" valign="top">
          <a href="${appUrl}/artist/${encodeURIComponent(a1.name)}" target="_blank" style="display: block; background: #181818; border: 1px solid #282828; border-radius: 10px; padding: 13px 15px; text-decoration: none;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td valign="middle">
                  <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">${a1.name}</div>
                  <div style="font-size: 11px; color: #8E8E8E; margin-top: 3px;">${a1.tag}</div>
                </td>
                <td width="16" align="right" valign="middle">
                  <span style="color: #00C853; font-size: 14px; font-weight: 700; line-height: 1;">&rsaquo;</span>
                </td>
              </tr>
            </table>
          </a>
        </td>
        <td width="50%" style="padding: 4px;" valign="top">
          ${a2 ? `
          <a href="${appUrl}/artist/${encodeURIComponent(a2.name)}" target="_blank" style="display: block; background: #181818; border: 1px solid #282828; border-radius: 10px; padding: 13px 15px; text-decoration: none;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td valign="middle">
                  <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">${a2.name}</div>
                  <div style="font-size: 11px; color: #8E8E8E; margin-top: 3px;">${a2.tag}</div>
                </td>
                <td width="16" align="right" valign="middle">
                  <span style="color: #00C853; font-size: 14px; font-weight: 700; line-height: 1;">&rsaquo;</span>
                </td>
              </tr>
            </table>
          </a>
          ` : ''}
        </td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to FreeSong</title>
  <style>
    :root {
      color-scheme: dark;
      supported-color-schemes: dark;
    }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    a { color: #00C853; text-decoration: none; }
    .btn-cta:hover { background-color: #00E676 !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; color: #FFFFFF;">

  <!-- Outer Canvas -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 32px 12px;">
    <tr>
      <td align="center">

        <!-- Main Card Container (Max 580px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121212; border: 1px solid #242424; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);">
          
          <!-- Top Brand Accent Bar -->
          <tr>
            <td height="3" style="background: #00C853; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header / Brand Logo -->
          <tr>
            <td align="center" style="padding: 36px 24px 20px 24px;">
              <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img 
                  src="${logoUrl}" 
                  alt="FreeSong.in" 
                  width="160" 
                  style="display: block; width: 160px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto;" 
                />
              </a>
            </td>
          </tr>

          <!-- Welcome Pill Badge -->
          <tr>
            <td align="center" style="padding: 0 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background: rgba(0, 200, 83, 0.1); border: 1px solid rgba(0, 200, 83, 0.3); border-radius: 999px; padding: 5px 16px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #00C853;">
                      ACCOUNT CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Greeting Hero -->
          <tr>
            <td style="padding: 24px 32px 10px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.25;">
                Welcome to FreeSong, ${safeName}
              </h1>
              <p style="margin: 14px 0 0 0; font-size: 15px; line-height: 1.6; color: #A7A7A7; font-weight: 400;">
                Your music streaming account is all set up. Stream millions of tracks, explore discographies, and curate your personal library in high fidelity.
              </p>
            </td>
          </tr>

          <!-- Spotify-Style Clean Button -->
          <tr>
            <td align="center" style="padding: 22px 24px 32px 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 999px; background-color: #00C853;">
                    <a href="${appUrl}" target="_blank" class="btn-cta" style="display: inline-block; padding: 15px 42px; font-size: 14px; font-weight: 800; color: #000000 !important; text-decoration: none; letter-spacing: 0.8px; text-transform: uppercase; border-radius: 999px; background-color: #00C853;">
                      START LISTENING
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="height: 1px; background: #222222;"></div></td>
          </tr>

          <!-- THE FREESONG ADVANTAGE -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #00C853; margin-bottom: 4px;">
                THE FREESONG ADVANTAGE
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">
                Engineered for pure listening
              </div>
            </td>
          </tr>

          <!-- Feature Cards -->
          <tr>
            <td style="padding: 12px 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <div style="background-color: #181818; border: 1px solid #282828; border-radius: 12px; padding: 16px 18px;">
                      <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Lossless Audio & Zero Interruptions</div>
                      <div style="font-size: 13px; color: #8E8E8E; line-height: 1.5;">Experience studio-grade audio streaming for official tracks and albums without video ad pauses.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <div style="background-color: #181818; border: 1px solid #282828; border-radius: 12px; padding: 16px 18px;">
                      <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Smart Algorithmic Radio</div>
                      <div style="font-size: 13px; color: #8E8E8E; line-height: 1.5;">Dynamic shelves seamlessly curate up-next recommendations according to your musical taste.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="background-color: #181818; border: 1px solid #282828; border-radius: 12px; padding: 16px 18px;">
                      <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Instant Cloud Synchronization</div>
                      <div style="font-size: 13px; color: #8E8E8E; line-height: 1.5;">Your liked music, custom playlists, and listening history remain synced across all your devices.</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="height: 1px; background: #222222;"></div></td>
          </tr>

          <!-- RECOMMENDED ARTISTS TO EXPLORE (INDIAN & GLOBAL ENGLISH, NO IMAGES, NO EMOJIS) -->
          <tr>
            <td style="padding: 26px 32px 10px 32px;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #00C853; margin-bottom: 4px;">
                FEATURED & TRENDING ARTISTS
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">
                Recommended to start your playlist
              </div>
            </td>
          </tr>

          <!-- Artist Chips Table (Indian & Global English) -->
          <tr>
            <td style="padding: 4px 28px 28px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                ${artistRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Support Concierge Box -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #181818; border: 1px solid #282828; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 13px; color: #8E8E8E; line-height: 1.5;">
                      Have questions or feedback? Contact our team anytime at
                      <a href="mailto:support@ganatube.in" style="color: #00C853; text-decoration: none; font-weight: 700;">support@ganatube.in</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td height="1" style="background: #222222; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <div style="font-size: 12px; color: #727272; line-height: 1.6;">
                This email was sent to <span style="color: #A7A7A7;">${userEmail}</span> regarding your FreeSong account.
              </div>
              <div style="margin-top: 12px; font-size: 12px;">
                <a href="${appUrl}/explore" style="color: #8E8E8E; text-decoration: none; margin: 0 8px;">Explore</a> &bull;
                <a href="${appUrl}/library" style="color: #8E8E8E; text-decoration: none; margin: 0 8px;">Library</a> &bull;
                <a href="${appUrl}/terms" style="color: #8E8E8E; text-decoration: none; margin: 0 8px;">Terms</a> &bull;
                <a href="${appUrl}/privacy" style="color: #8E8E8E; text-decoration: none; margin: 0 8px;">Privacy</a>
              </div>
              <div style="font-size: 11px; color: #555555; margin-top: 14px;">
                &copy; ${new Date().getFullYear()} FreeSong.in Media. Sent from <strong>support@ganatube.in</strong> via Hostinger Cloud.
              </div>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Send Welcome Email via Hostinger SMTP
 * @param {Object} options
 * @param {string} options.email - User email address
 * @param {string} [options.name] - User full name
 * @param {number} [options.userId] - MySQL user id to mark welcome_email_sent
 * @param {boolean} [options.force=false] - When true, bypass duplicate check (e.g. for testing)
 */
export async function sendWelcomeEmail({ email, name, userId, force = false }) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid recipient email' };
  }

  // Deduplication guard: check if user already received welcome email
  if (!force) {
    try {
      const existing = userId 
        ? await query('SELECT welcome_email_sent FROM users WHERE id = ?', [userId])
        : await query('SELECT welcome_email_sent FROM users WHERE email = ?', [email]);
      if (existing && existing.length > 0 && existing[0].welcome_email_sent === 1) {
        return { success: true, message: 'Welcome email already sent previously', alreadySent: true };
      }
    } catch (e) {
      // Continue if DB check fails
    }
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Welcome Email] Hostinger SMTP password not set in .env. Email skipped for:', email);
    return { success: false, error: 'SMTP credentials not configured in environment' };
  }

  const fromAddress = process.env.SMTP_FROM || '"FreeSong.in" <support@ganatube.in>';
  const safeName = (name && name !== 'FreeSong Listener' && name !== 'Google User') ? name.trim() : email.split('@')[0];

  const mailOptions = {
    from: fromAddress,
    to: email,
    replyTo: 'support@ganatube.in',
    subject: `Welcome to FreeSong, ${safeName}`,
    html: generateWelcomeEmailHtml(name, email),
    text: `Welcome to FreeSong, ${safeName}!\n\nYour account is ready. Stream official tracks, build playlists, and discover new favorites with zero video ad interruptions.\n\nStart listening now: ${process.env.APP_URL || 'https://freesong.in'}\n\nFreeSong.in Media\nsupport@ganatube.in`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Welcome Email] Successfully sent to ${email} (Message ID: ${info.messageId})`);

    // Mark as sent in MySQL database so it's never duplicated
    if (userId) {
      await query('UPDATE users SET welcome_email_sent = 1 WHERE id = ?', [userId]).catch(() => {});
    } else {
      await query('UPDATE users SET welcome_email_sent = 1 WHERE email = ?', [email]).catch(() => {});
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Welcome Email] Failed sending to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}
