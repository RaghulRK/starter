const nodemailer = require("nodemailer");
const htmltoText = require("html-to-text");
const pug = require("pug");

exports.module = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.from = `Raghul Kumar <${process.env.EMAIL_FROM}>`;
        this.url = url;
        this.firstName = user.name.split(" ")[0];
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }
    async send(template, subject) {
        // Render the html file based on the pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmltoText.fromString(html),
        }
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send("welcome", "Welcome to natours family!");
    }
}