const crypto = require("crypto");
class Crypt {
    constructor(str) {
        this.algorithm = "des-ede3-cbc";
        this.initVector = 'INITVECT';
        //crypto.randomBytes(16);INITVECTOR123456
        this.securitykey = 'FfuwTQonP0xnBmtf12345678'
        //crypto.randomBytes(32);FfuwTQonP0xnBmtf1bPqPn3j1JO01Cwq
        this.message = str;
        this.encrypt = this.encrypt.bind(this);
    }

    encrypt() {
        // const abc = crypto.getCiphers().map(item => {
        //     return crypto.getCipherInfo(item)
        // });
        // return abc;
        const cipher = crypto.createCipheriv(this.algorithm, this.securitykey, this.initVector);
        let encryptedData = cipher.update(this.message, "utf-8", "hex");
        encryptedData += cipher.final("hex");
        return encryptedData;
    }

    decrypt(encryptedData) {
        const decipher = crypto.createDecipheriv(this.algorithm, this.securitykey, this.initVector);
        let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
        decryptedData += decipher.final("utf8");
        return decryptedData;
    }
}
module.exports = Crypt;