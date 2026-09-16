const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed. Please send a POST request."
    });
  }

  try {
    const { name, email, phone, course, mode, message } = req.body || {};

    // Validate required fields
    if (!name || !email || !phone || !course || !mode || !message) {
      return res.status(400).json({
        success: false,
        message: "Please complete all application fields."
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanPhone = String(phone).trim();
    const cleanCourse = String(course).trim();
    const cleanMode = String(mode).trim();
    const cleanMessage = String(message).trim();

    // Name validation
    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters."
      });
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // Phone validation
    if (cleanPhone.length < 7 || cleanPhone.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number."
      });
    }

    // Message validation
    if (cleanMessage.length < 5 || cleanMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 5 and 1000 characters."
      });
    }

    // Check credentials
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactReceiver = process.env.CONTACT_RECEIVER || smtpUser;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";

    if (!smtpUser || !smtpPass) {
      console.error("Missing SMTP credentials (SMTP_USER or SMTP_PASS).");
      return res.status(500).json({
        success: false,
        message: "Email service is not configured on the server."
      });
    }

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // 1. Send Admin Notification Email
    const adminMailOptions = {
      from: `"AVERA Admissions" <${smtpUser}>`,
      to: contactReceiver,
      replyTo: cleanEmail,
      subject: `New AVERA Application - ${cleanName}`,
      text: `
NEW AVERA APPLICATION
=====================

Full Name:
${cleanName}

Email Address:
${cleanEmail}

Phone Number:
${cleanPhone}

Course / Track:
${cleanCourse}

Learning Mode:
${cleanMode}

Why do you want to join?
${cleanMessage}

=====================
Submitted via AVERA website.
      `.trim(),
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
  <h2 style="color: #247a95; margin-bottom: 8px;">New AVERA Application</h2>
  <p style="color: #666; font-size: 14px; margin-top: 0;">A new candidate has submitted an application via the website.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 18px 0;">
  
  <table style="width: 100%; font-size: 14px; line-height: 1.6; border-collapse: collapse;">
    <tr><td style="padding: 6px 0; color: #777; width: 140px;"><strong>Full Name:</strong></td><td style="color: #222;">${cleanName}</td></tr>
    <tr><td style="padding: 6px 0; color: #777;"><strong>Email Address:</strong></td><td style="color: #222;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
    <tr><td style="padding: 6px 0; color: #777;"><strong>Phone Number:</strong></td><td style="color: #222;">${cleanPhone}</td></tr>
    <tr><td style="padding: 6px 0; color: #777;"><strong>Course / Track:</strong></td><td style="color: #222;">${cleanCourse}</td></tr>
    <tr><td style="padding: 6px 0; color: #777;"><strong>Learning Mode:</strong></td><td style="color: #222;">${cleanMode}</td></tr>
  </table>

  <div style="margin-top: 16px; padding: 14px; background: #ffffff; border-left: 4px solid #f37f59; border-radius: 6px;">
    <strong style="color: #333; display: block; margin-bottom: 6px;">Why do you want to join?</strong>
    <p style="color: #555; margin: 0; white-space: pre-wrap;">${cleanMessage}</p>
  </div>
</div>
      `.trim()
    };

    const info = await transporter.sendMail(adminMailOptions);
    console.log("Admin notification sent. Message ID:", info.messageId);

    // 2. Send Applicant Confirmation Email (Auto-reply)
    try {
      await transporter.sendMail({
        from: `"AVERA Admissions" <${smtpUser}>`,
        to: cleanEmail,
        subject: `Application Received - AVERA`,
        text: `
Dear ${cleanName},

Thank you for applying to AVERA!

We have successfully received your application for "${cleanCourse}" (${cleanMode} mode). Our admissions and mentoring team will review your details and get in touch with you shortly.

Application Summary:
- Name: ${cleanName}
- Course / Track: ${cleanCourse}
- Learning Mode: ${cleanMode}
- Contact Phone: ${cleanPhone}

Warm regards,
AVERA Admissions Team
        `.trim(),
        html: `
<div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 25px; border-radius: 12px; background-color: #fafbfc; border: 1px solid #e7eaec;">
  <h2 style="color: #247a95; margin-top: 0;">Thank You for Applying, ${cleanName}!</h2>
  <p style="color: #444; font-size: 15px; line-height: 1.6;">
    We have received your application for <strong>${cleanCourse}</strong> (${cleanMode} mode). Our team will review your submission and contact you soon.
  </p>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border: 1px solid #e0e5e8; border-radius: 8px;">
    <h4 style="margin: 0 0 10px; color: #173d4b;">Application Summary</h4>
    <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Selected Course:</strong> ${cleanCourse}</p>
    <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Learning Mode:</strong> ${cleanMode}</p>
    <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Phone:</strong> ${cleanPhone}</p>
  </div>

  <p style="color: #777; font-size: 13px; line-height: 1.5;">
    If you have any questions, feel free to reply directly to this email.
  </p>
  <p style="color: #247a95; font-weight: bold; font-size: 14px; margin-bottom: 0;">
    Warm regards,<br>Team AVERA
  </p>
</div>
        `.trim()
      });
      console.log("Confirmation sent to applicant:", cleanEmail);
    } catch (applicantErr) {
      console.warn("Applicant confirmation error:", applicantErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully ✓"
    });
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      success: false,
      message: "Application email sending failed.",
      error: error.message
    });
  }
};
