const pluralize = require('pluralize');
const fileSystem = require('fs'),
  path = require('path');
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
class DynamicRouteController {
  async handle(req, res) {
    try {
      var module = req.params.module;
      var action = req.params.action || 'list';
      let moduleInSingular = pluralize.singular(module);
      let moduleSplits = moduleInSingular.split('-');
      moduleInSingular = '';
      moduleInSingular = moduleSplits.map((moduleSplit) => {
        return moduleInSingular.concat(capitalizeFirstLetter(moduleSplit));
      });
      moduleInSingular = moduleInSingular.join('');
      // moduleInSingular = capitalizeFirstLetter(moduleInSingular)
      var normalizedPath = require('path').join(__dirname, '');
      const controllers = {};
      require('fs')
        .readdirSync(normalizedPath)
        .forEach(function (file) {
          const className = file.replace('.js', '').trim();
          controllers[className] = require(`./${file}`);
        });
      const controller_obj = eval(
        `new controllers.${moduleInSingular}Controller`
      );
      var response = await controller_obj[action](req, res);
      // console.log(response);
      if (
        response &&
        'downloadable_file' in response &&
        response.downloadable_file &&
        'fileName' in response.downloadable_file
      ) {
        const toBeDeletedAfterDownload =
          response.downloadable_file.toBeDeletedAfterDownload;
        const filepath = path.join(
          appRoot,
          '/',
          response.downloadable_file.fileName
        );
        // console.log(filepath);
        var stat = fileSystem.statSync(filepath);
        res.writeHead(200, {
          'Content-Type': response.downloadable_file.contentType || 'text/csv',
          'Content-Length': stat.size,
          'Content-Disposition':
            'attachment; filename=' + response.downloadable_file.fileName,
        });
        const file = fileSystem.createReadStream(filepath);
        if (toBeDeletedAfterDownload) {
          file.on('end', function () {
            fileSystem.unlink(filepath, function () {});
          });
        }
        file.pipe(res);
        return;
      } else {
        res.json({ results: response });
      }
    } catch (error) {
      console.error(error);
      let statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        message: error.message,
        errors: error.data,
        trace: error.stack,
      });
    }
  }
}

module.exports = new DynamicRouteController();
