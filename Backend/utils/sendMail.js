require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP ERROR:", error);
    } else {
        console.log("✅ SMTP SERVER READY");
    }
});

const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent:", info.messageId);

        return info;

    } catch (error) {
        console.error("❌ Mail Error:", error);
        throw error;
    }
};

module.exports = sendMail;