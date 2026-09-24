const nodemailer = require("nodemailer");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Reject unsupported HTTP methods (405 Method Not Allowed)
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed. Please send a POST request.`
    });
  }

  try {
    // Check 1: Empty request body
    if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: Request body cannot be empty.",
        errors: [{ field: "body", message: "No data payload provided." }]
      });
    }

    // Check 2: Honeypot Anti-Bot Trap
    if (req.body._gotcha) {
      return res.status(200).json({
        success: true,
        message: "Application submitted successfully ✓"
      });
    }

    const { name, email, phone, course, mode, message } = req.body;
    const errors = [];

    // --- Name Validation ---
    if (name === undefined || name === null || typeof name !== "string") {
      errors.push({ field: "name", message: "Full Name is required and must be text." });
    } else {
      const clean = name.trim();
      if (clean.length === 0) {
        errors.push({ field: "name", message: "Name cannot be empty or just spaces." });
      } else if (clean.length < 2 || clean.length > 80) {
        errors.push({ field: "name", message: "Name must be between 2 and 80 characters." });
      }
    }

    // --- Email Validation ---
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email === undefined || email === null || typeof email !== "string") {
      errors.push({ field: "email", message: "Email is required and must be text." });
    } else {
      const clean = email.trim();
      if (clean.length === 0) {
        errors.push({ field: "email", message: "Email cannot be empty." });
      } else if (clean.length > 120) {
        errors.push({ field: "email", message: "Email cannot exceed 120 characters." });
      } else if (!emailRegex.test(clean)) {
        errors.push({ field: "email", message: "Please enter a valid email address (e.g. name@domain.com)." });
      }
    }

    // --- Phone Validation ---
    if (phone === undefined || phone === null || typeof phone !== "string") {
      errors.push({ field: "phone", message: "Phone number is required and must be text." });
    } else {
      const clean = phone.trim();
      if (clean.length === 0) {
        errors.push({ field: "phone", message: "Phone number cannot be empty." });
      } else if (clean.length < 7 || clean.length > 20) {
        errors.push({ field: "phone", message: "Phone number must be between 7 and 20 digits." });
      }
    }

    // --- Course Validation ---
    if (course === undefined || course === null || typeof course !== "string") {
      errors.push({ field: "course", message: "Course selection is required." });
    } else {
      const clean = course.trim();
      if (clean.length < 2 || clean.length > 100) {
        errors.push({ field: "course", message: "Please select a valid course or track." });
      }
    }

    // --- Mode Validation ---
    if (mode === undefined || mode === null || typeof mode !== "string") {
      errors.push({ field: "mode", message: "Learning mode is required." });
    } else {
      const clean = mode.trim();
      if (clean.length < 2 || clean.length > 50) {
        errors.push({ field: "mode", message: "Please select a valid learning mode." });
      }
    }

    // --- Message Validation ---
    if (message === undefined || message === null || typeof message !== "string") {
      errors.push({ field: "message", message: "Message is required and must be text." });
    } else {
      const clean = message.trim();
      if (clean.length === 0) {
        errors.push({ field: "message", message: "Message cannot be empty or whitespace." });
      } else if (clean.length < 5 || clean.length > 1000) {
        errors.push({ field: "message", message: "Message must be between 5 and 1000 characters." });
      }
    }

    // Return 400 Bad Request with all accumulated errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0].message,
        errors: errors
      });
    }

    // Sanitized Inputs
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCourse = course.trim();
    const cleanMode = mode.trim();
    const cleanMessage = message.trim();

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

    // Send Email to Admin
    await transporter.sendMail({
      from: `"AVERA Admissions" <${smtpUser}>`,
      to: contactReceiver,
      replyTo: cleanEmail,
      subject: `New AVERA Application - ${cleanName}`,
      text: `NEW AVERA APPLICATION\n=====================\n\nFull Name: ${cleanName}\nEmail: ${cleanEmail}\nPhone: ${cleanPhone}\nCourse: ${cleanCourse}\nLearning Mode: ${cleanMode}\n\nMessage:\n${cleanMessage}\n\n=====================\nSubmitted through the AVERA website.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
          <h2 style="color: #247a95; margin-bottom: 8px;">New AVERA Application</h2>
          <p style="color: #666; font-size: 14px; margin-top: 0;">A new candidate has submitted an application via the website.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 18px 0;">
          <table style="width: 100%; font-size: 14px; line-height: 1.6; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #777; width: 140px;"><strong>Full Name:</strong></td><td style="color: #222;">${escapeHtml(cleanName)}</td></tr>
            <tr><td style="padding: 6px 0; color: #777;"><strong>Email Address:</strong></td><td style="color: #222;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #777;"><strong>Phone Number:</strong></td><td style="color: #222;">${escapeHtml(cleanPhone)}</td></tr>
            <tr><td style="padding: 6px 0; color: #777;"><strong>Course / Track:</strong></td><td style="color: #222;">${escapeHtml(cleanCourse)}</td></tr>
            <tr><td style="padding: 6px 0; color: #777;"><strong>Learning Mode:</strong></td><td style="color: #222;">${escapeHtml(cleanMode)}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 14px; background: #ffffff; border-left: 4px solid #f37f59; border-radius: 6px;">
            <strong style="color: #333; display: block; margin-bottom: 6px;">Why do you want to join?</strong>
            <p style="color: #555; margin: 0; white-space: pre-wrap;">${escapeHtml(cleanMessage)}</p>
          </div>
        </div>
      `
    });

    // Send auto-reply to applicant
    try {
      await transporter.sendMail({
        from: `"AVERA Admissions" <${smtpUser}>`,
        to: cleanEmail,
        subject: `Application Received - AVERA`,
        text: `Dear ${cleanName},\n\nThank you for applying to AVERA!\nWe have received your application for "${cleanCourse}" (${cleanMode} mode). Our team will review your details and contact you shortly.\n\nWarm regards,\nAVERA Admissions Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 25px; border-radius: 12px; background-color: #fafbfc; border: 1px solid #e7eaec;">
            <h2 style="color: #247a95; margin-top: 0;">Thank You for Applying, ${escapeHtml(cleanName)}!</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6;">
              We have received your application for <strong>${escapeHtml(cleanCourse)}</strong> (${escapeHtml(cleanMode)} mode). Our team will review your submission and contact you soon.
            </p>
            <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border: 1px solid #e0e5e8; border-radius: 8px;">
              <h4 style="margin: 0 0 10px; color: #173d4b;">Application Summary</h4>
              <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Selected Course:</strong> ${escapeHtml(cleanCourse)}</p>
              <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Learning Mode:</strong> ${escapeHtml(cleanMode)}</p>
              <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Phone:</strong> ${escapeHtml(cleanPhone)}</p>
            </div>
            <p style="color: #247a95; font-weight: bold; font-size: 14px; margin-bottom: 0;">Warm regards,<br>Team AVERA</p>
          </div>
        `
      });
    } catch (applicantErr) {
      console.warn("Could not send applicant confirmation email:", applicantErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully ✓"
    });

  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      success: false,
      message: "Application email sending failed. Please try again later."
    });
  }
};