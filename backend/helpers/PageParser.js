const { Layout, Component, Page, CompanyPortalMetaTag } = require("../models");
class PageParser {
    constructor(slug) {
        this.slug = slug;
        this.page = null;
        this.preview = this.preview.bind(this);
        this.getPageNLayout = this.getPageNLayout.bind(this);
    }

    async getPageNLayout() {
        this.page = await Page.findOne({
            where: { slug: this.slug },
            include: 'Layout'
        });
        if (!this.page || !this.page.Layout) {
            const errorObj = new Error("Sorry! Page not found");
            errorObj.statusCode = 404;
            throw errorObj;
        }
    }

    async preview() {
        await this.getPageNLayout();
        let layout_html = this.page.Layout.html;
        const page_title = this.page.name;
        let content = this.page.html;
        const page_keywords = this.page.keywords;
        const page_descriptions = this.page.descriptions;
        const page_meta_code = this.page.meta_code;
        let layout_keywords = await CompanyPortalMetaTag.findOne({
            where: { tag_name: 'Keywords', company_portal_id: this.page.company_portal_id },
        });
        let layout_descriptions = await CompanyPortalMetaTag.findOne({
            where: { tag_name: 'Description', company_portal_id: this.page.company_portal_id },
        });
        layout_keywords = layout_keywords ? layout_keywords.tag_content : '';
        layout_descriptions = layout_descriptions ? layout_descriptions.tag_content : '';
        layout_html = eval('`' + layout_html + '`')
        return layout_html;
    }
}
module.exports = PageParser