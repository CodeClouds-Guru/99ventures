const moment = require('moment');
module.exports = [
  {
    name: 'format',
    fn: function (options) {
      return options.fn(this) ? moment(options.fn(this)).format('llll') : '';
    },
  },
  {
    name: 'ifCond',
    fn: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return v1 == v2 ? options.fn(this) : options.inverse(this);
        case '===':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '!=':
          return v1 != v2 ? options.fn(this) : options.inverse(this);
        case '!==':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '<':
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case '&&':
          return v1 && v2 ? options.fn(this) : options.inverse(this);
        case '||':
          return v1 || v2 ? options.fn(this) : options.inverse(this);
        case 'in':
          var v2_arr = v2.split(',').map((x) => Number(x));
          if (v2_arr.indexOf(v1) >= 0) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        default:
          return options.inverse(this);
      }
    },
  },
  {
    name: 'for',
    fn: function (from, to, incr, block) {
      var accum = '';
      for (var i = from; i <= to; i += incr) accum += block.fn(i);
      return accum;
    },
  },
  {
    name: 'ifEquals',
    fn: function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
  {
    name: 'dateFormat',
    fn: function (date, format) {
      if (date)
        return format
          ? moment(date).format(format)
          : moment(date).format('DD/MM/YYYY');
      else return '';
    },
  },
  {
    name: 'timeFormat',
    fn: function (date, format) {
      if (date)
        return format
          ? moment(date).format(format)
          : moment(date).format('hh:mm a');
      else return '';
    },
  },
  {
    name: 'timeFromNow',
    fn: function (date) {
      return date ? moment(date).fromNow() : '';
    },
  },
  {
    name: 'switch',
    fn: function (value, options) {
      this.switch_value = value;
      return options.fn(this);
    },
  },
  {
    name: 'case',
    fn: function (value, options) {
      if (value == this.switch_value) {
        return options.fn(this);
      }
    },
  },
  {
    name: 'toLower',
    fn: function (value) {
      return value.toLowerCase();
    },
  },
  {
    name: 'toUpper',
    fn: function (value) {
      return value.toUpperCase();
    },
  },
  {
    name: 'ucFirst',
    fn: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);;
    },
  },
];
