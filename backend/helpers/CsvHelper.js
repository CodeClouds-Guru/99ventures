const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

class CsvHelper {
  constructor(data, header) {
    this.data = data
    this.header = header
    this.generateCsv = this.generateCsv.bind(this);
  }

  async generateCsv() {
    const filename = `report-${new Date().getTime()}.csv`;
    const csv = csvWriter.createObjectCsvWriter({
      path: path.join(appRoot, filename),
      header: this.header
    });
    await csv.writeRecords(this.data);
    return filename;
  }
}

module.exports = CsvHelper;
