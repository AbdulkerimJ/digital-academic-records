import { Resend } from "resend";
import AppError from "../utils/appError.js";

// 1. INITIALIZATION

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "Digital Academic Records <onboarding@resend.dev>";


 // 2. CORE EMAIL ENGINE
export const sendEmail = async ({ to, subject, html }) => {
  // Simulation mode for development
  if (!resend) {
    console.log("------------------------------------------");
    console.log("📧 EMAIL SIMULATION (Set RESEND_API_KEY for real sending)");
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log("------------------------------------------");
    return { simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      // Throwing AppError allows the global error handler or .catch() blocks to handle it
      throw new AppError(`Email service error: ${error.message}`, 500);
    }

    return data;
  } catch (err) {
    // If it's already an AppError, rethrow it
    if (err instanceof AppError) throw err;
    
    // Otherwise, wrap it in an AppError
    throw new AppError(`Unexpected email error: ${err.message}`, 500);
  }
};

// 3. EMAIL TEMPLATES

export const sendInvitationEmail = async ({ to, firstName, inviteLink }) => {
  const subject = "Welcome to Digital Academic Records - Action Required";
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #2563eb; margin-bottom: 24px;">Welcome, ${firstName}!</h2>
      
      <p>You have been invited to join the <strong>Digital Academic Records</strong> management system.</p>
      <p>To access your account and set up your password, please click the button below:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: background-color 0.3s ease;">
          Activate My Account
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Note:</strong> This activation link will expire in 24 hours.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        If the button above doesn't work, copy and paste this URL into your browser:<br>
        <span style="word-break: break-all; color: #2563eb;">${inviteLink}</span>
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
};
