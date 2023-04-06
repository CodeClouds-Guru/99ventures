const axios = require('axios');
class IpQualityScore {
    constructor() {
        this.baseUrl = 'https://ipqualityscore.com/api/json/';
        this.privetKey = process.env.IP_QUALITY_SCORE_PRIVATE_KEY;
        console.log(this.privetKey);
        this.instance = axios.create({
            baseURL: this.baseUrl,
        });
        this.getFromServer = this.getFromServer.bind(this);
        this.getIpReport = this.getIpReport.bind(this);
    }
    async getFromServer(url, params = null) {
        let resp = {
            status: false,
            report: null,
            error: '',
        }
        try {
            const response = await this.instance.get(url, { params });
            resp.status = true;
            resp.report = response.data;
        } catch (e) {
            resp.error = e.message
        } finally {
            return resp;
        }
    }
    async getIpReport(ip) {
        const response = await this.getFromServer(`ip/${this.privetKey}/${ip}`, {
            strictness: 0,
            allow_public_access_points: true,
            lighter_penalties: true,
        });
        return response;
    }
    async getEmailReport(email) {
        const response = await this.getFromServer(`email/${this.privetKey}/${email}`);
        return response;
    }
    async getPhoneNumberReport(ph) {
        const response = await this.getFromServer(`phone/${this.privetKey}/${ph}`, {
            country: ['IN', 'US', 'UK'],
            strictness: 1
        });
        return response;
    }
}
module.exports = IpQualityScore