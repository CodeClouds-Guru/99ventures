const axios = require("axios");
const handler = {
    get(target, prop) {
        return !(prop in target)
            ? target[prop]
            : function (...args) {
                try {
                    return target[prop].apply(this, args);
                } catch (e) {
                    return {
                        status: false,
                        error: e.message
                    };
                }
            };
    }
};
class Lucid {
    constructor() {
        this.instance = axios.create({
            baseURL: 'https://api.samplicio.us',
            timeout: 10000,
            headers: { 'Authorization': '1E1E0F7F-77B6-4732-9ED3-9D2953A7BF3F' }
        });
        this.suppliers = this.suppliers.bind(this);
        return new Proxy(this, handler);
    }
    async suppliers() {
        // throw new Error('Custom Error');
        const response = await this.instance.get('Core/v1/Suppliers/AllWithAccount');
        return response.data;
    }
}

module.exports = Lucid;