const axios = require('axios');
class IpQualityScore {
    constructor() {
        this.baseUrl = 'https://ipqualityscore.com/api/json/ip/';
        this.privetKey = process.env.IP_QUALITY_SCORE_PRIVATE_KEY
        this.instance = axios.create({
            baseURL: this.baseUrl,
        });
    }
    async getIpReport(ip) {
        let resp = {
            status: false,
            report: null,
            error: '',
        }
        try {
            const response = await this.instance.get(`${this.privetKey}/${ip}`, {
                params: {
                    strictness: 0,
                    allow_public_access_points: true,
                    lighter_penalties: true,
                }
            });
            resp.status = true;
            resp.report = response.data;
        } catch (e) {
            resp.error = e.message
        } finally {
            return resp;
        }
    }
}
module.exports = IpQualityScore