const IpQualityScoreClass = require("../helpers/IpQualityScore");
const { CompanyPortal, IpConfiguration, IspConfiguration, CountryConfiguration, IpLog, MemberNote, Country } = require("../models");
const { Op } = require("sequelize");
const messageBox = {
    IP_BLACKLISTED: {
        error_code: 'ACCX001',
        error_message: 'IP is blacklisted'
    },
    ISP_BLACKLISTED: {
        error_code: 'ACCX002',
        error_message: 'ISP is blacklisted'
    },
    UNAVAILABLE_COUNTRY: {
        error_code: 'ACCX003',
        error_message: 'You are accessing this site from a country where we are unavailable right now'
    },
    VPN_DETECTED: {
        error_code: 'ACCX004',
        error_message: 'Please turn off your VPN to access this site'
    },
    TOR_DETECTED: {
        error_code: 'ACCX005',
        error_message: 'Please turn off Tor to access this site'
    },
    COUNTRY_CHANGED: {
        error_code: 'ACCX006',
        error_message: 'Looks like you are trying to connect from a different location other than your usual location. Please get back to your home location and then try to access this site'
    }
}

function getIp(req) {
    let ip = req.ip;
    if (Array.isArray(ip)) {
        ip = ip[0]
    } else {
        ip = ip.replace("::ffff:", "");
    }
    return ip;
}

function getMemberOfThisSession(req) {
    const member = null
    if ('member' in req.session) {
        member = req.session.member;
    }
    return member;
}

async function getCompanyPortalId(req) {
    var company_portal_id = 1;
    const existing_portal = await CompanyPortal.findOne({
        where: {
            domain: {
                [Op.substring]: req.get('host')
            }
        }
    })
    return existing_portal ? existing_portal.id : company_portal_id
}

async function redirectWithErrorMessage(req, res, error_code) {
    const member = getMemberOfThisSession(req);
    const msg = error_code in messageBox ? messageBox[error_code] : 'Some unexpected error occured'
    if (['VPN_DETECTED', 'TOR_DETECTED', 'COUNTRY_CHANGED'].includes(error_code) && member && member.status !== 'suspended') {
        await MemberNote.create({
            user_id: null,
            member_id: member.id,
            previous_status: member.status,
            current_status: 'suspended',
            note: error_code
        });
        member.status = 'suspended';
        await member.save();
    }
    req.session.flash = { access_error: msg };
    res.redirect('/404');
}

async function checkIfCountryChanged(req, country_code) {
    const member = getMemberOfThisSession(req);
    const existing_country = await Country.findOne({
        where: {
            iso: country_code
        }
    });
    return existing_country && member.country_id && existing_country.id !== member.country_id
}

module.exports = async function (req, res, next) {
    const ip = getIp(req);
    const company_portal_id = await getCompanyPortalId(req)
    const is_blacklisted_ip = await IpConfiguration.count({
        where: {
            company_portal_id: company_portal_id,
            status: 0,
            ip: ip,
        }
    });
    if (is_blacklisted_ip > 0) {
        await redirectWithErrorMessage(req, res, 'IP_BLACKLISTED')
        return;
    }
    const reportObj = new IpQualityScoreClass();
    const geo = await reportObj.getIpReport(ip);

    console.info('ip', ip, 'ipQualityscore', geo)

    const is_blacklisted_isp = await IspConfiguration.count({
        where: {
            company_portal_id: company_portal_id,
            status: 0,
            isp: geo.report.ISP,
        }
    });
    if (is_blacklisted_isp > 0) {
        await redirectWithErrorMessage(req, res, 'ISP_BLACKLISTED')
        return;
    }

    const is_blacklisted_country = await CountryConfiguration.count({
        where: {
            company_portal_id: company_portal_id,
            status: 0,
            iso: geo.report.country_code,
        }
    });
    if (is_blacklisted_country > 0) {
        await redirectWithErrorMessage(req, res, 'UNAVAILABLE_COUNTRY')
        return;
    }
    if (geo.report.vpn) {
        await redirectWithErrorMessage(req, res, 'VPN_DETECTED')
        return;
    }
    if (geo.report.tor) {
        await redirectWithErrorMessage(req, res, 'TOR_DETECTED')
        return;
    }
    const is_country_changed = await checkIfCountryChanged(req, geo.report.country_code);
    if (is_country_changed) {
        await redirectWithErrorMessage(req, res, 'COUNTRY_CHANGED')
        return;
    }
    next();

}
