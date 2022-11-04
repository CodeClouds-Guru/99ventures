const FileHelper = require('../../helpers/fileHelper')
const mime = require('mime-types')
const ArchieverClass = require("../../helpers/Archiever");

class FileManagerController {
  constructor() { }
  async list(req, res) {
    let file_path = 'file-manager'
    if (req.body.path != '') {
      file_path = 'file-manager' + '/' + req.body.path
    }
    const fileHelper = new FileHelper('', file_path, req)
    let file_list = await fileHelper.getList()
    let file_objects = await this.objectStructure(file_list, fileHelper)
    return {
      data: file_objects
    }
  }
  //get a file details
  async view(req, res) {
    let id = req.params.id
    let object_key = Buffer.from(id, 'base64')
    object_key = object_key.toString('utf8')
    // return {k:object_key}
    const fileHelper = new FileHelper('', object_key, req)
    var meta = await fileHelper.getMetaData(object_key)
    let metadata = []
    let file_objects = []
    if (meta && 'Metadata' in meta)
      metadata = meta.Metadata
    if (req.query.type == 'metadata') {
      file_objects = {
        metadata: metadata,
      }
    } else {
      let file_list = await fileHelper.getObject()
      let mime_type = mime.lookup(
        process.env.S3_BUCKET_OBJECT_URL + object_key
      );
      if (mime_type) {

        let file_structure = []
        file_structure = object_key.split('/')

        file_objects = {
          id: id,
          type: 'file',
          name: file_structure[file_structure.length - 1],
          file_path: process.env.S3_BUCKET_OBJECT_URL + object_key,
          size: file_list.ContentLength,
          last_modified: file_list.LastModified,
          mime_type: mime_type,
          access: 'public',
          metadata: metadata,
        }
      }
    }
    return {
      data: file_objects
    }
  }
  async objectStructure(file_list, fileHelper) {
    let file_objects = []
    if (file_list.CommonPrefixes.length) {
      for (let i = 0; i < file_list.CommonPrefixes.length; i++) {
        let folder_structure = []
        folder_structure = file_list.CommonPrefixes[i].Prefix.split('/')
        if (folder_structure[folder_structure.length - 2] != '')
          file_objects.push({
            id: this.generateId(file_list.CommonPrefixes[i].Prefix, '', ''),
            type: 'folder',
            name: folder_structure[folder_structure.length - 2],
            file_path: '',
            size: '',
            last_modified: '',
            mime_type: '',
            access: 'public',
          })
      }
    }
    if (file_list.Contents.length) {
      //folders having files
      for (let j = 0; j < file_list.Contents.length; j++) {
        let file_structure = []
        file_structure = file_list.Contents[j].Key.split('/')
        let object_key = file_list.Contents[j]
        let mime_type = mime.lookup(
          process.env.S3_BUCKET_OBJECT_URL + object_key.Key
        );
        if (mime_type) {
          file_objects.push({
            id: this.generateId(object_key.Key, '', ''),
            type: 'file',
            name: file_structure[file_structure.length - 1],
            file_path: process.env.S3_BUCKET_OBJECT_URL + object_key.Key,
            size: object_key.Size,
            last_modified: object_key.LastModified,
            mime_type: mime_type,
            access: 'public'
          })
        }
      }
    }
    return file_objects
  }
  //generate id
  generateId(object_key, folder_names, folder_index) {
    if (object_key == '') {
      folder_names = folder_names.slice(0, folder_index + 1)
      object_key = folder_names.join('/')
    }
    let base64data = Buffer.from(object_key, 'utf8')
    object_key = base64data.toString('base64')
    return object_key
  }
  //upload file
  async save(req, res) {
    if (req.body.type == 'download') {
      let download_zip = await this.download(req, res)
    } else {
      let file_path = req.body.file_path
      if (file_path != '') {
        file_path = 'file-manager' + '/' + file_path
      } else {
        file_path = 'file-manager'
      }
      let files = []
      let file_name = []
      let acl_txt = 'public-read-write'
      if (req.body.private == 1)
        acl_txt = 'private'

      let metadata = {
        'x-amz-meta-alt-name': req.body.alt_name,
        'x-amz-meta-private': req.body.private,
        'x-amz-acl': acl_txt
      }

      if (req.files) {
        if (req.files.file.length) files = req.files.file
        else files[0] = req.files.file
        const fileHelper = new FileHelper(files, file_path, req)
        file_name = await fileHelper.upload(metadata)
      } else {
        let folder_name = req.body.folder_name
        let folder_path = file_path + '/' + folder_name
        const fileHelper = new FileHelper('', folder_path, req)
        file_name = await fileHelper.createFolder()
      }

      //get path object list
      const fileHelperList = new FileHelper('', file_path, req)
      let file_list = await fileHelperList.getList()
      // return file_list
      let file_objects = await this.objectStructure(file_list, fileHelperList)

      return {
        status: true,
        data: file_objects
      }
    }
  }
  //delete file
  async delete(req, res) {
    let model_ids = req.body.modelIds ?? []
    if (model_ids.length) {
      model_ids.forEach(async (model_id) => {
        let object_key = Buffer.from(model_id, 'base64')
        object_key = object_key.toString('utf8')
        const fileHelper = new FileHelper([], 'file-manager', req)
        let file_delete = await fileHelper.deleteFile(object_key)
      })
    }
    return {
      status: true,
      message: 'File Deleted.',
    }
  }
  //rename folder name
  async update(req, res) {
    let id = req.body.id
    let object_key = Buffer.from(id, 'base64')
    object_key = object_key.toString('utf8')
    let msg = "File Copied."
    if (req.body.type != 'update-metadata') {
      let file_path = req.body.file_path
      if (file_path != '') {
        file_path = 'file-manager' + '/' + file_path
      } else {
        file_path = 'file-manager'
      }
      let file_name = req.body.folder_name
      if (req.body.type == 'copy-file') {
        file_name = req.body.file_name
      }

      const fileHelper = new FileHelper('', object_key, req, file_name)
      let file_copy = await fileHelper.copyObjects(req.body.type)
    } else {
      let acl_txt = 'public-read-write'
      if (req.body.private == 1)
        acl_txt = 'private'
      let metadata = {
        'x-amz-meta-alt-name': req.body.alt_name,
        'x-amz-meta-private': req.body.private,
        'x-amz-acl': acl_txt
      }
      const fileHelper = new FileHelper('', object_key, req)
      let file_copy = await fileHelper.updateMetadata(metadata)
    }
    if (req.body.type == 'copy-file')
      msg = "File Copied."
    else if (req.body.type == 'copy')
      msg = "Folder Copied."
    else if (req.body.type == 'copy-file')
      msg = "Folder Renamed."
    else if (req.body.type == 'update-metadata')
      msg = "Metadata Updated."

    return {
      status: true,
      message: msg,
      data: [],
    }
  }
  //download files
  async download(req, res) {
    const fileHelper = new FileHelper('', 'zip-files', req)
    let object_ids = req.body.ids
    const archiver = new ArchieverClass('files')
    let s3 = await fileHelper.s3Connect()
    let flag = false
    if(object_ids.length){
      let object_keys = []
      for(let o_key = 0; o_key < object_ids.length; o_key++){
        let object_key = Buffer.from(object_ids[o_key], 'base64')
        object_key = object_key.toString('utf8')
        object_keys.push(object_key)

      }
      for (let i = 0; i < object_keys.length; i++) {
        let file_structure = []
        file_structure = object_keys[i].split('/')
        let s3File = await s3.getObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: object_keys[i]
        }).promise()
        if ('Body' in s3File) {
          flag = true;
          archiver.append(s3File.Body, file_structure[file_structure.length - 1])
        }
      }
      if (flag) {
        archiver.finalize();
        console.log(archiver.zip.pointer() + ' total bytes');
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", "attachment; filename=files.zip");
        archiver.zip.pipe(res);
      } else {
        res.json({
          status: false,
          message: 'No file to archieve'
        })
      }
    }else {
      res.json({
        status: false,
        message: 'No file to archieve'
      })
    }
  }
}

module.exports = FileManagerController