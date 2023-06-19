const axios = require("axios");
module.exports = async function (req, res, next) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].indexOf(req.method) >= 0 && req.session.google_captcha_settings && req.session.company_portal.is_google_captcha_used === 1) {
        if ('body' in req && 'g-recaptcha-response' in req.body) {
            gcap = req.body['g-recaptcha-response']
            if (gcap === undefined || gcap === '' || !gcap) {
                req.session.flash = { error: 'Invalid Google Captcha' };
                return res.redirect('back');
            }
            var secretKey = req.session.google_captcha_settings.site_token;
            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'];
            try {
                const re = await axios.get(verificationUrl, { "Content-Type": "application/x-www-form-urlencoded", 'json': true })
                console.log('gcap', re.data);
                if (re.data.success) {
                    return next();
                }
            } catch (error) {
                console.error(error)
            } finally {
                req.session.flash = { error: 'Captcha verification failed' };
                return res.redirect('back');
            }
        }
    }
    next();
}