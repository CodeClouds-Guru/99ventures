let archiver = require('archiver');
class Archiever {
    constructor(fileName) {
        if (!fileName || (typeof fileName === 'string' && fileName.trim().length === 0)) {
            throw new Error("Invalid filename");
        }
        this.zip = new archiver.create('zip');
        this.fileName = fileName;
        this.append = this.append.bind(this);
    }
    append(fileContent, fileName) {
        this.zip.append(fileContent, {
            name: fileName
        });
    }
    finalize() {
        this.zip.finalize();
    }
}
module.exports = Archiever