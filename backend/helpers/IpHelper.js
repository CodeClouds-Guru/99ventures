const { IpConfiguration, sequelize } = require('../models/index')
const queryInterface = sequelize.getQueryInterface()
class IpHelper {

    constructor() {
        this.checkIp = this.checkIp.bind(this)
    }
    //email parsing
    async checkIp(ip,company_portal_id) {
        try {
            let status = await IpConfiguration.findOne({where:{ip:ip,company_portal_id:company_portal_id,status:0}})
            if(status){
                return {status:true,blacklisted:true}
            }else{
                return {status:true,blacklisted:false}
            }
        }catch (error) {
            console.error("error", error);
            return {status:false}
          }
    }
}
module.exports = IpHelper