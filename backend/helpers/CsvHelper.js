const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

class CsvHelper {
  constructor() { }

  async generateDataForCsv(data, model) {
    let report_details = [];
    data.forEach(function (record, key) {
      if (record.dataValues.Member != null) {
        report_details.push({
          user_id: record.dataValues.member_id,
          username: record.dataValues.Member.dataValues.username,
          user_click_date: '',
          user_joined_date: record.dataValues.Member.dataValues.created_at,
          user_conversion_date: '',
          user_ip: record.dataValues.Member.dataValues.IpLogs
            ? record.dataValues.Member.dataValues.IpLogs[0].dataValues.ip
            : '',
          user_status: record.dataValues.Member.dataValues.status,
          cash_earned: model.dataValues.payout_amount,
          points_earned: model.dataValues.payout_amount,
          track_status: '',
          tracking_code: record.dataValues.track_id,
        });
      }
    });
    return await this.generateCsv(report_details);
  }
  async generateCsv(report) {
    const filename = `report-${new Date().getTime()}.csv`
    const csv = csvWriter.createObjectCsvWriter({
      path: path.join(appRoot, filename),
      header: [
        { id: 'user_id', title: 'ID' },
        { id: 'username', title: 'Username' },
        { id: 'user_status', title: 'Status' },
        { id: 'cash_earned', title: 'Cash Earned' },
      ]
    });
    await csv.writeRecords(report)
    return filename;
  }
}

module.exports = CsvHelper;
