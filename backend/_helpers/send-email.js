const nodemailer = require('nodemailer');
const config = require('config.json');


async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'lexi99@ethereal.email',
            pass: 'duWHDG61jMDED6gxS8'
        }
    });
    await transporter.sendMail({ from, to, subject, html });
}

module.exports = sendEmail;


