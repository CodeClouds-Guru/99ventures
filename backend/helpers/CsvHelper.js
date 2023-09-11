const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');
const EmailHelper = require('./EmailHelper');
class CsvHelper {
  constructor(data, header) {
    this.data = data;
    this.header = header;
    this.generateCsv = this.generateCsv.bind(this);
  }

  async generateCsv() {
    const filename = `report-${new Date().getTime()}.csv`;
    const csv = csvWriter.createObjectCsvWriter({
      path: path.join(appRoot, `public/${filename}`),
      header: this.header,
    });
    await csv.writeRecords(this.data);
    return filename;
  }

  generateAndEmailCSV(email) {
    console.log(email);
    const filename = `report-${new Date().getTime()}.csv`;
    const csv = csvWriter.createObjectCsvWriter({
      path: path.join(appRoot, `public/exports/${filename}`),
      header: this.header,
    });
    csv.writeRecords(this.data).then(() => {
      const email_helper = new EmailHelper({
        headers: { site_id: 1 },
      });
      email_helper.sendMail(
        'Here is the CSV you have requested to download',
        email,
        'Download Request has been Complete',
        [
          {
            filename,
            path: path.join(appRoot, `public/exports/${filename}`),
          },
        ]
      );
    });
  }
}

module.exports = CsvHelper;
