const { doubleCsrf } = require("csrf-csrf");
const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
    doubleCsrf({
        getSecret: (req) => req.secret,
        secret: process.env.NODE_APP_SECRET,
        cookieName: "x-csrf-token",
        cookieOptions: {
            sameSite: !(process.env.DEV_MODE === '1'),
            secure: !(process.env.DEV_MODE === '1'),
            signed: true
        },
        size: 64,
        ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    });

const csrfErrorHandler = (error, req, res, next) => {
    if (error == invalidCsrfTokenError) {
        req.session.error = {
            error: 'Page Expired!'
        }
        res.redirect('/500');
    } else {
        next();
    }
};
module.exports = { csrfErrorHandler, generateToken, doubleCsrfProtection }
