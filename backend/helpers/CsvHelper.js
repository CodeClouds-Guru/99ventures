const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

class CsvHelper {
  constructor() {}

  async generateDataForCsv(data, model) {
    let report_details = [];
    data.forEach(function (record, key) {
      if (record.dataValues.Member != null) {
        let ip =
          record.dataValues.Member.dataValues &&
          record.dataValues.Member.dataValues.IpLogs[0]
            ? record.dataValues.Member.dataValues.IpLogs[0].dataValues.ip
            : '';
        report_details.push({
          user_id: record.dataValues.member_id,
          username: record.dataValues.Member.dataValues.username,
          user_click_date: '',
          user_joined_date: record.dataValues.Member.dataValues.created_at,
          user_conversion_date: '',
          user_ip: ip,
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
    const filename = `report-${new Date().getTime()}.csv`;
    const csv = csvWriter.createObjectCsvWriter({
      path: path.join(appRoot, filename),
      header: [
        { id: 'user_id', title: 'ID' },
        { id: 'username', title: 'Username' },
        { id: 'user_status', title: 'Status' },
        { id: 'cash_earned', title: 'Cash Earned' },
        { id: 'points_earned', title: 'Points Earned' },
        { id: 'user_click_date', title: 'User Click Date' },
        { id: 'user_joined_date', title: 'user Joined Date' },
        { id: 'user_conversion_date', title: 'User Conversion Date' },
        { id: 'user_ip', title: 'User Ip' },
        { id: 'track_status', title: 'Track Status' },
        { id: 'tracking_code', title: 'Tracking Code' },
      ],
    });
    await csv.writeRecords(report);
    return filename;
  }
}

module.exports = CsvHelper;
