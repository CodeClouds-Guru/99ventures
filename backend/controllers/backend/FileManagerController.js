const FileHelper = require("../../helpers/fileHelper");

class FileManagerController {
  constructor() {
  }
  async list(req,res){
    const fileHelper = new FileHelper('',req);
    let file_name = await fileHelper.getList();
    console.log('filename',file_name)
  }
}

module.exports = FileManagerController