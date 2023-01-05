const csv = require('csv');
const fs = require('fs');

class CsvHelper {
  constructor() {}

  generateDataForCsv(data, model) {
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
    console.log(
      '===============report_details',
      this.generateCsv(report_details)
    );
  }
  generateCsv(report) {
    const stringifier = csv.stringify({
      header: true,
      columns: ['user_id', 'username', 'user_status', 'cash_earned'],
    });
    const writableStream = fs.createWriteStream('panda.csv');
    report.forEach((row) => {
      stringifier.write(row);
    });
    stringifier.pipe(writableStream);
    console.log('Finished writing data');
  }
}

module.exports = CsvHelper;
