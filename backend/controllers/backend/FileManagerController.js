const FileHelper = require("../../helpers/fileHelper");

class FileManagerController {
  constructor() {
  }
  async list(req,res){
    const fileHelper = new FileHelper('',req);
    let file_name = await fileHelper.getList();
    console.log('filename',file_name)
  }
  //upload file
  async save(req,res){
    let file_path = req.path
    if(file_path != ''){
      file_path = "file-manager"+"/"+file_path
    }else{
      file_path = "file-manager"
    }
    if (req.files) {
      files[0] = req.files.file;
      
      const fileHelper = new FileHelper(files, file_path, req);
      const file_name = await fileHelper.upload();
    }else{
      let folder_name = req.folder_name
      file_path = file_path+'/'+folder_name
    }
  }
}

module.exports = FileManagerController