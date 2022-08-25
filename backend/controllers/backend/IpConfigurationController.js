const Controller = require('./Controller')
const { IspConfiguration } = require('../../models/index')

class IpConfigurationController extends Controller{
    constructor() {
        super('IpConfiguration')
        this.list = this.list.bind(this)
        // this.save = this.save.bind(this)
    }
    //overide list function
    async list(req,res){
        let company_portal_id = req.headers.site_id
        let ip_list = await this.model.findAll({where:{status:0,company_portal_id:company_portal_id}})
        ip_list = ip_list.map((ip_result) => {
            return ip_result.ip
        })
        let isp_list = await IspConfiguration.findAll({where:{status:0,company_portal_id:company_portal_id}})
        isp_list = isp_list.map((isp_result) => {
            return ip_result.ip
        })

        return {
            result: { 
                data: {
                    ips: ip_list,
                    isps: isp_list
                }
            },
        }
    }
    //override save function
    async save(req,res){
        let company_portal_id = req.headers.site_id
        let ips = req.body.ips;
        let isps = req.body.isps;

        //remove previous ip records
        await this.model.destroy({
            where: { company_portal_id: company_portal_id,status:'0' },
        })

        //store ip list
        if(ips){
            ips = ips.map((ip) => {
                return {
                    ip:ip,
                    company_portal_id: company_portal_id,
                    status:0,
                    created_by: req.user.id
                }
            })
            //bulck create ip list
            await this.model.bulkCreate(ips)
        }

        //remove previous isp records
        await IspConfiguration.destroy({
            where: { company_portal_id: company_portal_id,status:0 },
        })

        //store isp list
        if(isps){
            isps = isps.map((isp) => {
                return {
                    isp:isp,
                    company_portal_id: company_portal_id,
                    status:0,
                    created_by: req.user.id
                }
            })
            
            //bulck create isp list
            await IspConfiguration.bulkCreate(isps)
        }
        return {
            message: "Record Updated"
          }
    }
    async getIpData(req, res) {
        try {
          const site_id = req.header("site_id") || 1;
          const company_id = req.header("company_id") || 1;
    
          const getIpData = await IpConfiguration.findAll({
            where: { status: "whitelisted" },
            attributes: ["ip"],
            include: ["CompanyPortal", {attributes: ['name']}],
          });
          return res.status(200).json({
            status: true,
            data: getIpData,
          });
        } catch (err) {
          console.log(err.message);
          return res.status(500).json({
            status: false,
            errors: "Unable to get data",
          });
        }
    }
}
module.exports = IpConfigurationController