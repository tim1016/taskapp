const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'resonanceoncl@gmail.com',
        subject: 'Welcome to NodeJS',
        text: `Hello ${name}, Text is here`
    });
}


const sendByeBye = (email, name) => {
    sgMail.send({
        to: email,
        from: 'resonanceoncl@gmail.com',
        subject: 'ByeBye to NodeJS',
        text: `Hello ${name}, Bye`        
    })
}


module.exports = {
    sendWelcomeEmail,
    sendByeBye
}