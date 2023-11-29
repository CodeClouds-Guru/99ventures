/**
 * @description Module for global helpers
 * @author Sourabh (CodeClouds)
 */

/**
 * Description: Similar to asset() helper in laravel
 * @param {String} part_url
 */
require('dotenv').config();

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
// const axios = require('axios')

exports.asset = (part_url = '') => {
  base_asset_url = process.env.URI;
  if (base_asset_url.slice(-1) !== '/') {
    base_asset_url += '/';
  }
  if (part_url[0] === '/') {
    part_url = part_url.substr(1);
  }
  return base_asset_url + part_url;
};

/**
 * Description: Similar to asset() helper in laravel
 * @param {String} key
 * @param {any} value
 * @param {Array} arrayOfObjects
 */
exports.search = (key, value, arrayOfObjects) => {
  for (var i = 0; i < arrayOfObjects.length; i++) {
    if (arrayOfObjects[i][key] === value) {
      return arrayOfObjects[i];
    }
  }
  return null;
};

exports.generateToken = (params) => {
  return jwt.sign(params, process.env.APP_SECRET, { expiresIn: 100000 });
};

// exports.downloadImageFromLink = (url, image_path) =>
//   axios({
//     url,
//     responseType: 'stream',
//   }).then(
//     (response) =>
//       new Promise((resolve, reject) => {
//         response.data
//           .pipe(fs.createWriteStream(image_path))
//           .on('finish', () => resolve())
//           .on('error', (e) => reject(e))
//       })
//   )

exports.stringToSlug = (str) => {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  var to = 'aaaaeeeeiiiioooouuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};
exports.cartesian = (...a) =>
  a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

exports.replaceAllWithReplacements = (str, replacements) => {
  var replacedString = str;
  const find = Object.keys(replacements);
  const replace = Object.values(replacements);
  for (var i = 0; i < find.length; i++) {
    replacedString = replacedString.replaceAll(find[i], replace[i]);
  }
  return replacedString;
};

exports.createCommentSignature = (code) => {
  // return {
  //   'start': `<!-- ${code} starts -->`,
  //   'end': `<!-- ${code} ends -->`
  // }
  return { start: '', end: '' };
};

// exports.cryptoEncryption = (str) => {
//   var pass = process.env.CRYPTO_KEY || "99_VENTURES";
//   const mystr = crypto
//     .createHash("sha256", pass)
//     .update(str,'binary')
//     .digest("hex");
//   console.log(crypto.getCipherInfo());

//   return mystr;
// };

// exports.cryptoDecryption = (str) => {
//   var pass = process.env.CRYPTO_KEY || "99_VENTURES";
//   var mykey = crypto.createDecipher("aes-128-cbc", pass);
//   var mystr = mykey.update(str, "hex", "utf8");
//   mystr += mykey.final("utf8");
//   console.log(mystr);
//   return mystr;
// };
exports.genarateHash = (hash_obj) => {
  var buf = Buffer.from(hash_obj, 'utf8');
  return buf.toString('base64');
};
exports.decodeHash = (str) => {
  let hash_obj = Buffer.from(str, 'base64');
  hash_obj = hash_obj.toString('utf8');
  return JSON.parse(hash_obj);
};
exports.capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

exports.generateHashForLucid = (url) => {
  const secretKey = '6DnzZ47SP5h2a2z4E86898Vz4Y2k484u879YQs8o5VuDXN375ahb7Y37co7R9P3a4Zx0lP4b0lACy7Q348GP3';
  const hash = crypto.createHmac('sha1', secretKey).update(url, 'utf-8').digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
  // const hash = crypto.createHmac('sha1', process.env.LUCID_API_KEY).update(url, 'utf-8').digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
  return encodeURIComponent(hash);
}

exports.generateUserIdForSurveyProviders = (companyPortalName, memberId) => {
  var companyPortalName = companyPortalName.replaceAll(' ', '');
  var envType = '_';
  if (process.env.DEV_MODE == "0")
    envType = '_live_';
  else if (process.env.DEV_MODE == "1")
    envType = '_development_';
  else if (process.env.DEV_MODE == "2")
    envType = '_staging_';

  return companyPortalName + envType + memberId;
}

exports.extractUserIdForSurveyProviders = (userId) => {
  let strArry = userId.split('_');
  let memberId = strArry[3];
  return memberId;
}