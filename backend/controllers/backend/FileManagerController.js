const FileHelper = require("../../helpers/fileHelper");

class FileManagerController {
  constructor() {
  }
  async list(req,res){
    const fileHelper = new FileHelper('','file-manager',req);
    let file_list = await fileHelper.getList();
    return file_list
    let file_objects = []
    if(file_list)
    {
      for(let i = 0; i < file_list.length; i++){
        let folder_structure = []
        folder_structure = file_list[i].Key.split('/')
        if(folder_structure.length > 3){//company name/site id/file-manager/folder-name/file
          file_objects = this.folderStructure(file_objects,folder_structure,file_list[i]) 
        }
      }
      
    }
    return {
      data:file_objects
    }
  }
  //folder structure
  folderStructure(file_objects,folder_structure,object_key){
    let matched_object = file_objects
    let index_string = ''
    let indexes = []
    let start_index = 3;
    for(let i = 3; i < folder_structure.length - 1; i++){
        let get_index = this.getIndex(index_string,matched_object,folder_structure[i])
        if(get_index.folder_index != -1)
          matched_object = matched_object[get_index.folder_index].details
        // index_string = get_index.index_string
        indexes.push(get_index.folder_index)
    }
    let details_arr = []
    if(folder_structure[folder_structure.length - 1] !=''){
      details_arr = [{type:'file',name:folder_structure[folder_structure.length - 1],details:[],file_path:process.env.S3_BUCKET_OBJECT_URL+object_key.Key,size:object_key.Size,last_modified:object_key.LastModified,mime_type:'image/jpeg'}]
    }
    switch(indexes.length) {
      case 1:
        // single folder - company name/site id/file-manager/folder-name/file
        if(indexes[0] == -1)
          file_objects.push({type:'folder',name:folder_structure[start_index],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        else
          file_objects[indexes[0]].details.push(details_arr[0])
        break;
      case 2:
        // 2 layar
        if(indexes[0] == -1 && indexes[1] == -1){
          file_objects.push({type:'folder',name:folder_structure[start_index],details:[{type:'folder',name:folder_structure[start_index+1],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''}],file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        }
        else if(indexes[0] != -1 && indexes[1] == -1){
          file_objects[indexes[0]].details.push({type:'folder',name:folder_structure[start_index+1],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        }
        else{
          file_objects[indexes[0]].details[indexes[1]].details.push(details_arr[0])
        }
        break;
      case 3:
        // 3 layar
        if(indexes[0] == -1 && indexes[1] == -1 && indexes[2] == -1){
          file_objects.push({type:'folder',name:folder_structure[start_index],details:[{type:'folder',name:folder_structure[start_index+1],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''}],file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        }
        else if(indexes[0] != -1 && indexes[1] == -1 && indexes[2] == -1){
          file_objects[indexes[0]].details.push({type:'folder',name:folder_structure[start_index+1],details:[{type:'folder',name:folder_structure[start_index+2],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''}],file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        }
        else if(indexes[0] != -1 && indexes[1] != -1 && indexes[2] == -1){
          file_objects[indexes[0]].details[indexes[0]].details.push({type:'folder',name:folder_structure[start_index+1],details:details_arr,file_path:'',size:'',last_modified:object_key.LastModified,mime_type:''})
        }
        else
          file_objects[indexes[0]].details[indexes[1]].details[indexes[1]].details.push(details_arr[0])
        break;
      default:
        // code block
    }
    return file_objects
  }
  //find the index
  getIndex(index_string,matched_object,folder_name){
    let matched = false
    let folder_index = -1
    if(matched_object.length){
      for(let i = 0; i < matched_object.length; i++){
        if(matched_object[i].name == folder_name){
          folder_index = i
          matched = true
          break;
        }
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