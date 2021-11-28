const nodemailer = require("nodemailer");
const customError = require("./customError");
const ejs = require("ejs");
const { promisify } = require("util");
const path = require("path");
const { htmlToText } = require("html-to-text");

class Email {
    constructor(email, data) {
        this.email = email;
        this.data = data;
    }

    createTransport() {
        if (process.env.NODE_ENV === "production") {
            return nodemailer.createTransport({
                service: "SendGrid", //sendgrid
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }

        return nodemailer.createTransport({
            //mailtrap
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async send(template) {
        try {
            const renderView = promisify(ejs.renderFile);
            const layout = path.join(__dirname, "../views/emails/layoutEmail.ejs");
            const html = await renderView(layout, {
                ...this.data,
                template,
            });

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: this.email,
                subject: this.data.subject,
                html,
                text: htmlToText(html),
            };

            const transporter = this.createTransport();

            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.log(err);
            throw new customError(
                "There was an error when sending the email. Try again later!",
                500
            );
        }
    }

    async sendWelcome() {
        await this.send("welcome");
    }

    async sendResetPassword() {
        await this.send("passwordReset");
    }
}

module.exports = Email;

// module.exports = async (options) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port: process.env.EMAIL_PORT,
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: options.email,
//             subject: options.subject,
//             text: options.message,
//             // html: '',
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (err) {
//         console.log(err);
//         throw new customError("There was an error when sending the email. Try again later!", 500);
//     }
// };
