const { Page } = require('../../models')
const {
    SitemapStream
} = require('sitemap');
const { Op } = require("sequelize");

class SiteMapController {
    constructor() {
        this.sitemap = null;
        this.generate = this.generate.bind(this);
        this.makeDataSrc = this.makeDataSrc.bind(this);
    }
    async generate(hostname) {
        var smStream = new SitemapStream({ hostname })
        smStream = await this.makeDataSrc(smStream)
        return smStream;
    }
    async makeDataSrc(smStream) {
        const pages = await Page.findAll({
            attributes: ['slug', 'updated_at'],
            where: {
                status: 'published',
                auth_required: 0,
                slug: {
                    [Op.notIn]: ['404', '500', '503', 'survey-complete', 'survey-quota', 'survey-security', 'survey-termination', 'notice', 'survey-reached', 'survey-taken', 'no-cookies', 'survey-notavailable', 'survey-notqualified']
                }
            }
        })
        for (let page of pages) {
            smStream.write({
                url: page.slug[0] === '/' ? page.slug : `/${page.slug}`,
                changefreq: 'monthly'
            })
        }
        return smStream;
    }
}

module.exports = SiteMapController
