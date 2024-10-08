const Controller = require('./Controller');
const { Op } = require('sequelize');
const {
  Member,
  MemberBalance,
  WithdrawalRequest,
  PaymentMethod,
  MemberNotification, MemberTransaction
} = require('../../models/index');
const moment = require('moment');
const eventBus = require('../../eventBus');
class MemberTransactionController extends Controller {
  constructor() {
    super('MemberTransaction');
  }
  // override list function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;
    var fields = Object.assign({}, this.model.fields);
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    var option_where = options.where || {};
    var new_option = {};
    var and_query = {
      completed_at: {
        [Op.between]: query_where.completed_at ?? [
          moment().subtract(30, 'days').toISOString(),
          moment().toISOString(),
        ],
      },
    };

    if (Object.keys(query_where).length > 0) {
      new_option[Op.and] = {
        ...option_where,
        ...and_query,
        ...(query_where.status &&
          query_where.status == 5 && {
          parent_transaction_id: { [Op.ne]: null },
        }),
      };
    }
    options.where = new_option;
    options.attributes.push('type', 'parent_transaction_id', 'amount_action');
    // options.logging = console.log;
    options.include = [
      {
        model: Member,
        required: false,
        attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
      },
      {
        model: WithdrawalRequest,
        // attributes: ['member_transaction_id', 'status'],
        include: {
          model: PaymentMethod,
          attributes: ['name', 'slug'],
        },
      },
      {
        model: this.model,
        as: 'ParentTransaction',
        attributes: [
          'member_id',
          'status',
          'created_at',
          'note',
          'amount_action',
        ],
        include: [
          {
            model: Member,
            required: false,
            attributes: ['id', 'first_name', 'last_name', 'username'],
          },
          {
            model: WithdrawalRequest,
            include: {
              model: PaymentMethod,
            },
          },
        ],
      },
    ];
    const { docs, pages, total } = await this.model.paginate(options);
    let transaction_list = [];
    // console.log(docs);
    docs.forEach(function (record, key) {
      if (
        record.dataValues.Member != null &&
        record.dataValues.Member.dataValues.avatar != ''
      ) {
        record.dataValues.Member.dataValues.avatar =
          process.env.S3_BUCKET_OBJECT_URL +
          record.dataValues.Member.dataValues.avatar;
      }
      if (record.dataValues.transaction_id === null) {
        record.dataValues.transaction_id = 'N/A';
      }
      record.dataValues.new_status = '';
      //status manipulation

      if (
        record.dataValues.amount_action === 'member_withdrawal' ||
        record.dataValues.status == 5
      ) {
        var status_arr = [3, 4];
        if (record.dataValues.status == 3 || record.dataValues.status == 4) {
          record.dataValues.new_status = 'pending';
        }
        if (
          record.dataValues.parent_transaction_id &&
          record.dataValues.status == 2
        ) {
          record.dataValues.new_status =
            record.dataValues.ParentTransaction.status;
        }
        if (record.dataValues.status == 1) {
          record.dataValues.new_status = record.dataValues.WithdrawalRequest
            ? record.dataValues.WithdrawalRequest.status
            : record.dataValues.status;
        }
        if (
          record.dataValues.status == 5 &&
          record.dataValues.type === 'credited'
        ) {
          record.dataValues.new_status = 2;
        }
      }
      if (
        record.dataValues.WithdrawalRequest !== null &&
        record.dataValues.WithdrawalRequest.PaymentMethod !== null &&
        record.dataValues.amount_action === 'member_withdrawal'
      ) {
        record.dataValues.amount_action = `Withdrawal (${record.dataValues.WithdrawalRequest.PaymentMethod.name})`;
        // record.dataValues.amount_action = `${record.dataValues.amount_action} (${record.dataValues.WithdrawalRequest.PaymentMethod.name})`;
      }
      if (record.dataValues.amount_action === 'offerwall') {
        record.dataValues.amount_action = record.dataValues.note;
        // record.dataValues.amount_action = `${record.dataValues.amount_action} (${record.dataValues.note})`;
      }

      if (
        record.dataValues.amount_action === 'referral' &&
        record.dataValues.ParentTransaction !== null &&
        record.dataValues.ParentTransaction.dataValues.Member !== null
      ) {
        record.dataValues.amount_action = `${record.dataValues.amount_action} (${record.dataValues.ParentTransaction.Member.username})`;
        // record.setDataValue(
        //   'ParentTransaction->Member.username',
        //   record.dataValues.ParentTransaction.Member.username || 'N/A'
        // );
        // record.dataValues.username =
        //   record.dataValues.ParentTransaction.Member.username || 'N/A';
      }

      switch (record.dataValues.status) {
        case 1:
          record.dataValues.status = 'processing';
          break;
        case 2:
          record.dataValues.status = 'completed';
          break;
        case 3:
          record.dataValues.status = 'failed';
          break;
        case 4:
          record.dataValues.status = 'declined';
          break;
        case 5:
          record.dataValues.status = 'reverted';
          break;
        default:
          record.dataValues.status = 'initiated';
          break;
      }
      // console.log('record.dataValues.new_status', record.dataValues.new_status);
      switch (record.dataValues.new_status) {
        case 1:
          record.dataValues.new_status = 'processing';
          break;
        case 2:
          record.dataValues.new_status = 'completed';
          break;
        case 3:
          record.dataValues.new_status = 'failed';
          break;
        case 4:
          record.dataValues.new_status = 'declined';
          break;
        case 5:
          record.dataValues.new_status = 'reverted';
          break;
        case 'pending':
          record.dataValues.new_status = 'pending';
          break;
        case 'approved':
          record.dataValues.new_status = 'completed';
          break;
        default:
          record.dataValues.new_status = record.dataValues.status;
          break;
      }
      // console.log(
      //   'record.dataValues.new_status formatted',
      //   record.dataValues.new_status
      // );
      if (
        record.dataValues.amount_action === 'reversed_transaction' &&
        record.dataValues.ParentTransaction
      ) {
        // console.log(
        //   'record.dataValues.amount_action',
        //   record.dataValues.ParentTransaction.dataValues
        // );
        record.dataValues.amount_action =
          record.dataValues.ParentTransaction.dataValues.amount_action ==
            'promo_code'
            ? record.dataValues.amount_action +
            '-' +
            record.dataValues.ParentTransaction.dataValues.note
            : record.dataValues.amount_action;
        record.dataValues.amount_action =
          record.dataValues.ParentTransaction.dataValues.amount_action ==
            'survey'
            ? record.dataValues.note
            : record.dataValues.amount_action;
        // console.log(
        //   'record.dataValues.amount_action',
        //   record.dataValues.amount_action
        // );
      }

      transaction_list.push(record);
    });

    fields.transaction_id.listing = !(
      query_where &&
      'type' in query_where &&
      query_where.type === 'withdraw'
    );
    // fields.note.listing = !(
    //   query_where &&
    //   'type' in query_where &&
    //   query_where.type === 'withdraw'
    // );
    return {
      result: {
        data: transaction_list,
        pages: pages,
        total: total,
      },
      fields,
    };
  }

  // override update function
  async update(req, res) {

    let transaction_id = req.params.id || null;
    let member_id = req.body.member_id || null;
    let type = req.body.type || null;
    if (transaction_id) {
      if (type === 'revert') {
        try {
          let transaction = await this.model.findByPk(transaction_id);
          if (transaction.status != 5) {
            let member = await Member.findOne({
              where: { id: member_id },
              include: {
                model: MemberBalance,
                as: 'member_amounts',
                where: { amount_type: 'cash' },
              },
            });
            // console.log(member.member_amounts[0].amount);
            //current transaction
            await this.reverseTransactionUpdate({
              member_balance_amount: member.member_amounts[0].amount,
              transaction_amount: transaction.amount,
              member_id: member_id,
              transaction_id: transaction_id,
              created_by: req.user.id,
            });

            //Email for member
            // let member_mail = await this.sendMailEvent({
            //   action: 'Transaction Reversed',
            //   data: {
            //     email: member.email,
            //     details: {
            //       members: member,
            //       transaction,
            //     },
            //   },
            //   req: req,
            // });

            //referral transaction
            // if (transaction.parent_transaction_id) {
            let referral_transactions = await this.model.findOne({
              where: {
                parent_transaction_id: transaction_id,
                amount_action: 'referral',
              },
            });
            if (referral_transactions) {
              let referral_member = await Member.findOne({
                where: { id: referral_transactions.member_id },
                include: {
                  model: MemberBalance,
                  as: 'member_amounts',
                  where: { amount_type: 'cash' },
                },
              });

              await this.reverseTransactionUpdate({
                member_balance_amount: referral_member.member_amounts[0].amount,
                transaction_amount: referral_transactions.amount,
                member_id: referral_transactions.member_id,
                transaction_id: referral_transactions.id,
                created_by: req.user.id,
              });

              //Email for referral member
              // let referral_member_mail = await this.sendMailEvent({
              //   action: 'Transaction Reversed',
              //   data: {
              //     email: referral_member.email,
              //     details: {
              //       members: referral_member,
              //       transaction: referral_transactions,
              //     },
              //   },
              //   req: req,
              // });
            }

            return {
              status: true,
              message: 'Record Updated',
            };
          } else {
            return {
              status: false,
              message: 'Record Already Reverted',
            };
          }
        } catch (e) {
          console.log(e);
          this.throwCustomError(e, 404);
        }
      }
    }
  }

  async reverseTransactionUpdate(data) {
    let updated_balance =
      parseFloat(data.member_balance_amount) -
      parseFloat(data.transaction_amount);

    await this.model.update(
      { status: 5, updated_by: data.created_by },
      {
        where: {
          id: data.transaction_id, //1
        },
      }
    );

    let parent_transaction = await this.model.findByPk(data.transaction_id);
    let note = 'Reverse transaction - ' + parent_transaction.note;
    await this.model.insertTransaction({
      type: 'withdraw',
      amount: parseFloat(data.transaction_amount),
      note: note,
      member_id: data.member_id,
      amount_action: 'reversed_transaction',
      status: 5,
      modified_total_earnings: updated_balance,
      parent_transaction_id: data.transaction_id,
      created_by: data.created_by,
    });

    await MemberBalance.update(
      { amount: updated_balance },
      {
        where: {
          member_id: data.member_id,
          amount_type: 'cash',
        },
      }
    );

    //Notify member
    await MemberNotification.addMemberNotification({
      member_id: data.member_id,
      action: 'reversed_transaction',
      amount: parseFloat(data.transaction_amount),
    });
    return true;
  }

  //send mail event call
  async sendMailEvent(mail_data) {
    return eventBus.emit('send_email', mail_data);
  }

  // async hello(req, res) {
  //   return res.json({
  //     status: true,
  //     data: 'hello'
  //   });
  // }

  // Api for - Referral amount calculation related changes
  async referralCalc(req, res) {
    // console.log(req.params);
    // console.log(req.query);
    let response = null;
    try {
      response = await MemberTransaction.referralCalculation(req.params.member_id);
    } catch (e) {
      console.log(e)
      response = e.message;
    }

    return res.json({
      status: true,
      data: response
    });
  }

}
module.exports = MemberTransactionController;
