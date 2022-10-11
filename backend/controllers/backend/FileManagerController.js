const FileHelper = require("../../helpers/fileHelper");

class FileManagerController {
  constructor() {
  }
  async list(req,res){
    const fileHelper = new FileHelper('','file-manager',req);
    let file_list = await fileHelper.getList();
    let file_objects = []
    return {
      status:true,
      data:[
        {
          type:'folder',
          name: 'abc',
          details:[
            {
              type:'folder',
              name:'new folder',
              details:[
                {
                  type:'file',
                  name:'1665138206251sample.pdf',
                  details:[],
                  file_path:"https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665138206251sample.pdf"
                }
              ],
              file_path:''
            }
          ],
          file_path:''
        },
        {
          type:'file',
          name:'1665138206251sample.pdf',
          details:[],
          file_path:"https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665138206251sample.pdf"
        }
      ]
    }
    if(file_list)
    {
      for(let i = 0; i < file_list.length; i++){
        let folder_structure = []
        folder_structure = file_list[i].Key.split('/')
        if(folder_structure.length > 3){//company name/site id/file-manager/folder-name/file
          file_objects = this.folderStructure(file_objects,folder_structure) 
        }
        // file_objects.push(folder_structure)
        // if(folder_structure.length == 4){
        //   if(folder_structure[folder_structure.length - 1] == ''){
        //     file_objects.push({type:'folder',name:folder_structure[2],delails:[],file_path:''})
        //   }else{
        //     file_objects.push({type:'file',name:folder_structure[3],delails:[],file_path:file_list[i].Key})
        //   }
        // }else{
        //   file_structure = this.folderStructure(file_objects,folder_structure)
          
        // }
      }
      
    }
    return {
      data:file_objects
    }
  }
  //folder structure
  folderStructure(file_objects,folder_structure){
    let matched_object = file_objects
    let index_string = ''
    let indexes = []
    for(let i = 3; i < folder_structure.length - 1; i++){
        let get_index = this.getIndex(index_string,matched_object,folder_structure[i])
        // index_string = get_index.index_string
        indexes.push(get_index.folder_index)
    }

    switch(indexes.length) {
      case 1:
        // single folder - company name/site id/file-manager/folder-name/file
        file_objects.push({type:'folder',name:folder_structure[0],delails:[],file_path:''})
        break;
      case 2:
        // 2 layar
        file_objects.push({type:'folder',name:folder_structure[0],delails:[],file_path:''})
        break;
      case 3:
        // 3 layar
        break;
      default:
        // code block
    }
  }
  //find the index
  getIndex(index_string,matched_object,folder_name){
    let matched = false
    let folder_index = ''
    for(let i = 0; i < matched_object.length; i++){
      if(matched_object[i].name == folder_name){
        folder_index = i
        matched = true
        // if(index_string == '')
        //   index_string = index_string+"["+i+"]"
        // else
        //   index_string = index_string+".details["+i+"]"
        break;
      }
    }
    return {
      matched:matched,
      folder_index:folder_index
    }
  }
  //upload file
  async save(req,res){
    let file_path = req.body.file_path
    if(file_path != ''){
      file_path = "file-manager"+"/"+file_path
    }else{
      file_path = "file-manager"
    }
    let files = []
    let file_name = []
    if (req.files) {
      files[0] = req.files.file;
      const fileHelper = new FileHelper(files, file_path, req);
      file_name = await fileHelper.upload();
    }else{
      let folder_name = req.body.folder_name
      file_path = file_path+'/'+folder_name
      const fileHelper = new FileHelper('', file_path, req);
      file_name = await fileHelper.createFolder();
    }
    return {
      status:true,
      data:file_name
    }
  }
}

module.exports = FileManagerController