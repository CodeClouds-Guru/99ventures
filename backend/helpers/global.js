/**
 * @description Module for global helpers
 * @author Sourabh (CodeClouds)
 */

/**
 * Description: Similar to asset() helper in laravel
 * @param {String} part_url
 */
require('dotenv').config()
const jwt = require('jsonwebtoken')
const fs = require('fs')
// const axios = require('axios')

exports.asset = (part_url = '') => {
  base_asset_url = process.env.URI
  if (base_asset_url.slice(-1) !== '/') {
    base_asset_url += '/'
  }
  if (part_url[0] === '/') {
    part_url = part_url.substr(1)
  }
  return base_asset_url + part_url
}

/**
 * Description: Similar to asset() helper in laravel
 * @param {String} key
 * @param {any} value
 * @param {Array} arrayOfObjects
 */
exports.search = (key, value, arrayOfObjects) => {
  for (var i = 0; i < arrayOfObjects.length; i++) {
    if (arrayOfObjects[i][key] === value) {
      return arrayOfObjects[i]
    }
  }
  return null
}

exports.generateToken = (params) => {
  return jwt.sign(params, process.env.APP_SECRET, { expiresIn: 100000 })
}

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
  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
  var to = 'aaaaeeeeiiiioooouuuunc------'
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes

  return str
}
exports.cartesian = (...a) =>
  a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())))

exports.replaceAllWithReplacements = (str, replacements) => {
  var replacedString = str;
  const find = Object.keys(replacements)
  const replace = Object.values(replacements)
  for (var i = 0; i < find.length; i++) {
    replacedString = replacedString.replaceAll(find[i], replace[i]);
  }
  return replacedString;
}

exports.createCommentSignature = (code) => {
  return {
    'start': `<!-- ${code} starts -->`,
    'end': `<!-- ${code} ends -->`
  }
}
