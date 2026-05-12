import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendSupportEmailResponse = async ({ to, subject, message, response }) => {
  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 0 auto; background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 0px;">
      <div style="padding: 30px; border-bottom: 2px solid #000000;">
        <h1 style="margin: 0; font-size: 14px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #000000;">
          National Academic <span style="color: #3b82f6;">Registry</span>
        </h1>
      </div>
      
      <div style="padding: 30px;">
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
          Subject: <strong style="color: #000000;">"${subject}"</strong>
        </p>

        <div style="margin-bottom: 24px; padding: 15px; background-color: #f8fafc; border-left: 2px solid #cbd5e1;">
          <p style="color: #94a3b8; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;">Message</p>
          <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0;">${message}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #3b82f6; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px 0;">Our Response</p>
          <p style="color: #0f172a; font-size: 14px; line-height: 1.6; font-weight: 500; margin: 0;">
            ${response}
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 11px; font-style: italic;">
          Thank you for using the Digital Academic Registry.
        </p>
      </div>

      <div style="padding: 20px 30px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: left;">
        <p style="color: #cbd5e1; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
          System Notification &bull; ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("-----------------------------------------");
    console.log("SIMULATED EMAIL SENT TO:", to);
    console.log("SUBJECT:", subject);
    console.log("RESPONSE:", response);
    console.log("-----------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Registry Support <support@resend.dev>',
      to: [to],
      subject: `Support Update: ${subject}`,
      html: html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
