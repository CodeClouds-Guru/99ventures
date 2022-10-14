const AWS = require('aws-sdk')
const assert = require('assert')
var fs = require('fs')
class FileHelper {
  constructor(files, model, req,new_filename) {
    this.company_id = ''
    this.site_id = ''
    this.new_filename = ''
    if(req){
      this.company_id = req.headers.company_id
      this.site_id = req.headers.site_id
      this.new_filename = new_filename
    }
    this.files = files
    this.model = model
    this.storage_path = ''
    this.response = {
      status: false,
      files: [],
    }
    //get company details
    this.company = []
    
    this.upload = this.upload.bind(this)
    this.getPath = this.getPath.bind(this)
    this.s3Connect = this.s3Connect.bind(this)
    this.generateSignedUrl = this.generateSignedUrl.bind(this)
    this.deleteFile = this.deleteFile.bind(this)
    this.copyObjects = this.copyObjects.bind(this)
  }
  //upload file to s3 bucket  
  async upload() {
    var path = await this.getPath(this.model)
    for (var key of Object.keys(this.files)) {
      var file = this.files[key]
      var new_filename = Date.now() + file.name
      try {
        let s3 = await this.s3Connect()
        const imagePath = file.tempFilePath
        const blob = fs.readFileSync(imagePath)

        // const uploadedImage = await s3.upload({
          const uploadedImage = await s3.putObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path.concat(new_filename),
            Body: blob,
            ACL: "public-read"
        }).promise()

        this.response.status = true
        this.response.files[key] = {
          filename: path.concat(new_filename),
        }
      } catch (e) {
        this.response.trace = e
      }
    }
    return this.response
  }
  //create folder on bucket
  async createFolder(){
    var path = await this.getPath(this.model)
    try {
      let s3 = await this.s3Connect()
      await s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: path,
          Body: path,
          // ACL: "public-read"
      }).promise()

      this.response.status = true
    } catch (e) {
      this.response.trace = e
    }
    return this.response
  }
  
  //s3 bucket connection
  s3Connect(){
    let s3 =new AWS.S3({
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                region:process.env.AWS_DEFAULT_REGION,
                signatureVersion: "v4"
            })
    return s3
  }
  //get file path
  async getPath(model) {
    const { Company } = require('../models/index')
    this.company = await Company.findOne({
      attributes: ['name'],
      where: { id: this.company_id },
    })
    var base_path = ''
    if (model.trim().length > 0) {
      base_path += this.company.name+'/'+this.site_id+'/'+model + '/'
    }
    return base_path
  }
  //generate signed url
  generateSignedUrl(key){
    let s3 = this.s3Connect()
    const signedUrl = s3.getSignedUrl("getObject", {
      Key: key,
      Bucket: process.env.S3_BUCKET_NAME,
      Expires: 900, // S3 default is 900 seconds (15 minutes)
    });
    return signedUrl
  }
  //delete file
  async deleteFile(key){
    let s3 = this.s3Connect()
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: key
    };
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key:Key });
    });
    await s3.deleteObjects(deleteParams).promise();
    return true
  }
  
  //get folder list
  async getList(){
    this.company = await this.getCompanyDetails(this.company_id)
    
    let s3 = this.s3Connect()
    let get_objects = await s3.listObjectsV2({ 
      Bucket: process.env.S3_BUCKET_NAME,
      Delimiter: '/',
      Prefix: this.company.name+'/'+this.site_id+'/'+this.model+'/'
    }).promise()
    
    return get_objects
     
  }
  //get company details
  async getCompanyDetails(company_id){
    //company details
    const { Company } = require('../models/index')
    let company = await Company.findOne({
      attributes: ['name'],
      where: { id: company_id },
    })
    return company
  }
  //copy bucket objects
  async copyObjects(req_type){
    let s3 = this.s3Connect()
    let model_structure = this.model.split('/')
    model_structure[model_structure.length-2] = this.new_filename
    model_structure = model_structure.join('/')
    let pre_model = this.model
    await s3.listObjects({Bucket: process.env.S3_BUCKET_NAME,Prefix: this.model}, function(err, data) {
      
      if (data.Contents.length) {
        data.Contents.forEach(({ Key }) => {
          var params = {
            Bucket: process.env.S3_BUCKET_NAME,
            CopySource: process.env.S3_BUCKET_NAME + '/' + Key,
            Key: Key.replace(pre_model,model_structure)
          };
          s3.copyObject(params, function(copyErr, copyData){
            if (copyErr) {
              console.log(copyErr);
            }
          });
        });
      }
    });
    if(req_type == 'rename'){
      this.deleteFile(this.model)
    }
    return true
  }
}

module.exports = FileHelper