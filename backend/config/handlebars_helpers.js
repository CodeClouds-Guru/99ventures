module.exports = [
    {
        name: 'format',
        fn: function (options) {
            return options.fn(this) ? moment(options.fn(this)).format('llll') : '';
        }
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
                default:
                    return options.inverse(this);
            }
        }
    },
    {
        name: 'for',
        fn: function (from, to, incr, block) {
            var accum = '';
            for (var i = from; i <= to; i += incr)
                accum += block.fn(i);
            return accum;
        }
    },
    {
        name: 'ifEquals',
        fn: function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        }
    },
    {
        name: 'dateFormat',
        fn: function (date, format) {
            if (date)
                return format ? moment(date).format(format) : moment(date).format('DD/MM/YYYY')
            else
                return
        }
    },
    {
        name: 'timeFormat',
        fn: function (date, format) {
            if (date)
                return format ? moment(date).format(format) : moment(date).format('hh:mm a')
            else
                return
        }
    },
    {
        name: 'switch',
        fn: function (value, options) {
            this.switch_value = value;
            return options.fn(this);
        }
    },
    {
        name: 'case',
        fn: function (value, options) {
            if (value == this.switch_value) {
                return options.fn(this);
            }
        }
    },
]