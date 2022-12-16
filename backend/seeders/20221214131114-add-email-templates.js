"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      "email_templates",
      [
        {
          subject: "Forgot Password",
          body: '<!DOCTYPE html>\
          <html lang="en">\
            <head>\
              <meta charset="UTF-8" />\
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />\
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />\
              <title>Document</title>\
              <style>\
                @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap");</style>\
            </head>\
            <body style="margin: 0;padding: 15px;position: relative;font-family: \'Inter\',\'Montserrat\', sans-serif; max-width: 600px;margin: 0 auto;">\
              <table style="width: 100%;border-spacing: 0;border-radius: 10px;overflow: hidden;">\
                <thead>\
                  <tr>\
                    <td style="background-color: #111827;padding: 20px 0;color: #fff;text-align: center;">\
                      <h3 style="font-size: 28px;line-height: 1;font-weight: 700;margin: 0;">Reset Your Password</h3>\
                    </td>\
                  </tr>\
                </thead>\
                <tbody style="background-color: #f7f7f7;overflow: hidden;">\
                  <tr>\
                    <td style="padding: 50px 30px;font-size: 14px;line-height: 26px;">\
                      <img src="http://3.13.149.9/assets/images/logo/logo.png" alt="Scripteed" width="60px" height="60px" style="display: block;margin: 0 auto 30px auto;" />\
                      <p style="margin: 0;">A request has been received to change the password for your account</p>\
                      <a href="{reset_password_link}" style="display: table;padding: 16px 30px 14px 30px;font-size: 18px;line-height: 1;font-weight: 600;letter-spacing: 1px;color: rgb(33, 150, 243);text-decoration: none;text-transform: uppercase;text-align: center;border: 2px solid rgb(33, 150, 243);border-radius: 4px;margin: 40px auto 0 auto;">Reset Password</a>\
                      <p style="text-align: center;font-size: 12px;line-height: 16px;font-style: italic;margin: 15px 0 0 0;">If did not initiate this request, please ignore this mail.</p>\
                    </td>\
                  </tr>\
                </tbody>\
                <tfoot>\
                  <tr>\
                    <td style="padding: 8px;background-color: #111827;"><p style="text-align: center;font-size: 12px;line-height: 16px;margin: 1px 0 0 0;color:#fff">© 2022 | More Surveys | All rights reserved</p></td>\
                  </tr>\
                </tfoot>\
              </table>\
            </body>\
          </html>',
          body_json: "{}",
          company_portal_id:"1",
          created_at: new Date()
        },
        {
          subject: "Forgot Password",
          body: '<!DOCTYPE html>\
          <html lang="en">\
            <head>\
              <meta charset="UTF-8" />\
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />\
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />\
              <title>Document</title>\
              <style>\
                @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap");</style>\
            </head>\
            <body style="margin: 0;padding: 15px;position: relative;font-family: \'Inter\',\'Montserrat\', sans-serif; max-width: 600px;margin: 0 auto;">\
              <table style="width: 100%;border-spacing: 0;border-radius: 10px;overflow: hidden;">\
                <thead>\
                  <tr>\
                    <td style="background-color: #111827;padding: 20px 0;color: #fff;text-align: center;">\
                      <h3 style="font-size: 28px;line-height: 1;font-weight: 700;margin: 0;">Reset Your Password</h3>\
                    </td>\
                  </tr>\
                </thead>\
                <tbody style="background-color: #f7f7f7;overflow: hidden;">\
                  <tr>\
                    <td style="padding: 50px 30px;font-size: 14px;line-height: 26px;">\
                      <img src="http://3.13.149.9/assets/images/logo/logo.png" alt="Scripteed" width="60px" height="60px" style="display: block;margin: 0 auto 30px auto;" />\
                      <p style="margin: 0;">A request has been received to change the password for your account</p>\
                      <a href="{reset_password_link}" style="display: table;padding: 16px 30px 14px 30px;font-size: 18px;line-height: 1;font-weight: 600;letter-spacing: 1px;color: rgb(33, 150, 243);text-decoration: none;text-transform: uppercase;text-align: center;border: 2px solid rgb(33, 150, 243);border-radius: 4px;margin: 40px auto 0 auto;">Reset Password</a>\
                      <p style="text-align: center;font-size: 12px;line-height: 16px;font-style: italic;margin: 15px 0 0 0;">If did not initiate this request, please ignore this mail.</p>\
                    </td>\
                  </tr>\
                </tbody>\
                <tfoot>\
                  <tr>\
                    <td style="padding: 8px;background-color: #111827;"><p style="text-align: center;font-size: 12px;line-height: 16px;margin: 1px 0 0 0;color:#fff">© 2022 | More Surveys | All rights reserved</p></td>\
                  </tr>\
                </tfoot>\
              </table>\
            </body>\
          </html>',
          body_json: "{}",
          company_portal_id:"2",
          created_at: new Date()
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
