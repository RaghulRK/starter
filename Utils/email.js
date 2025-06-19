const nodemailer = require("nodemailer");

const sendEmail = async options =>{
    // 1 define the transporter using email trap, later in mail gun tool

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    //2  define the email options to be given
    const mailOptions = {
        from: 'Raghul Kumar <raghukrk2000@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html message later
    }

    // 3 send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;