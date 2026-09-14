const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Hostel Management <onboarding@resend.dev>",
            to,
            subject,
            html
        });

        if (error) {
            console.error("Resend Error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent:", data.id);
        return data;

    } catch (error) {
        console.error("Mail Error:", error);
        throw error;
    }
};

module.exports = sendMail;