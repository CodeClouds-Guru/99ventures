const csv = require('csv');
const { appendFileSync } = require('fs');

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
    console.log('===============report_details', report_details);
  }
  generateCsv(report) {
    try {
      appendFileSync('./contacts.csv', JSON.stringify(report));
    } catch (err) {
      console.error(err);
    }
    let csv_result = csv
      .generate({
        delimiter: '|',
        length: 20,
      })
      .pipe(
        csv.parse({
          delimiter: '|',
        })
      )
      .pipe(
        csv.transform((record) => {
          return record.map((value) => {
            return value.toUpperCase();
          });
        })
      )
      .pipe(
        csv.stringify({
          quoted: true,
        })
      )
      .pipe(process.stdout);
    // return csv_result;
  }
}

module.exports = CsvHelper;
