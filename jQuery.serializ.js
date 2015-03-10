;
(function(G) {
    /**
     * Try to set value on obj according to given path
     * @param  {[type]} obj  object that value to be set
     * @param  {[type]} path like 'people.mike.age'
     * @param  {[type]} v    value to be se, such as '27'
     * @return {[type]}      obj itself
     */
    function tryset(obj, path, v) {
        var last, part, parts, t, _i, _len;
        t = obj;
        parts = path.split('.');
        last = parts.pop();
        if (parts.length > 0) {
            for (_i = 0, _len = parts.length; _i < _len; _i++) {
                part = parts[_i];
                if (t[part] === void 0) {
                    t[part] = part.match(/^\d+$/) ? [] : {};
                }
                t = t[part];
            }
        }
        t[last] = v;
        return obj;
    };

    /**
     * get value from eles and set result[key] = value
     * @param  {[type]} eles elements that get values from
     * @param  {[type]} attr attribute that will be check against
     * @param  {[type]} key  key of value
     * @return {[type]}      object
     */
    function getValues(eles, attr, key) {
        var c, checked, child, ele, f, field, fields, fmt, tmp, json, k, m, mapping, name, obj, sep, result, v, val, _, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
        result = [];
        for (_i = 0, _len = eles.length; _i < _len; _i++) {
            ele = $(eles[_i]);
            json = {};
            fields = ele.attr(attr).split('|');
            for (_j = 0, _len1 = fields.length; _j < _len1; _j++) {
                field = fields[_j];
                _ref = field.split(':'), k = _ref[0], f = _ref[1];
                if (!f) {
                    f = k;
                    if (key) {
                        k = key;
                    }
                }
                if (typeof ele[f] === 'function') {
                    /**
                     * function call
                     */
                    v = ele[f]();
                    if (ele.is(':checkbox')) {
                        checked = ele[0].checked;
                        mapping = ele.data('map');
                        /**
                         * map checkbox status to string
                         */
                        if (mapping) {
                            v = mapping.split(',')[+checked];
                        } else {
                            v = checked ? v : '_';
                        }
                    }
                } else if (f[0] === '!') {
                    /**
                     * css
                     */
                    name = f.substr(1);
                    v = ele[0].style[name] || ele.css(name);
                } else if (m = f.match(/^\[([a-zA-Z]+)\]$/)) {
                    /**
                     * array
                     */
                    v = [];
                    ele.is('table') ? _ref1 = ele.find('tbody').children() : _ref1 = ele.children();
                    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                        child = _ref1[_k];
                        c = $(child);
                        if (c.find(m[0]).length <= 0 && !c.is(m[0])) {
                            continue;
                        }
                        v.push(_serialize(c, m[1]));
                    }
                } else if (m = f.match(/^\{([a-zA-Z]+)\}$/)) {
                    /**
                     * object
                     */
                    v = _serialize(ele, m[1]);
                } else if (typeof(_serialize[f]) == 'function') {
                    v = _serialize(f)(ele);
                } else {
                    v = ele[0].getAttribute(f) || ele.attr(f) || ele.data(f);
                }
                /**
                 * map 'true' and 'false' to boolean true and false
                 */
                if (v === 'true') {
                    v = true;
                } else if (v === 'false') {
                    v = false;
                }

                /**
                 * if there is a data-format="...$&..." attribute
                 * substitute $& with v and return the result
                 */
                fmt = ele.data('format');
                if (fmt) {
                    v = fmt.replace(/\$&/, v);
                }

                /**
                 * '_' will be ignored
                 */
                if (v !== '_') {
                    tryset(json, k, v);
                }
            }
            result.push(json);
        }
        return result;
    };

    function _serialize(element, attr) {
        var att, eles, json;
        json = {};
        att = "[" + attr + "]";
        eles = element.find(att);
        if (element.is(att)) {
            if (eles.length == 0) {
                eles = $([element]);
            } else {
                eles = eles.add(element);
            }
        } else if (eles.length == 0) {
            return null;
        }
        eles.each(function(i, e) {
            var ele, isList, key, values;
            isList = false;
            ele = $(e);
            key = ele.attr('key');
            values = getValues(ele, attr, key);
            $.extend(true, json, values[0]);
        });
        return json;
    };

    _serialize.DefaultAttr = 'serialize'

    _serialize.codeMirror = function(ele){
            editor = $(ele).data('editor')
            return editor ? editor.getValue() : '';
    };

    if (typeof jQuery == 'undefined') {
        throw Error('jQuery not found!');
    } else {
        jQuery.fn.serializ = function(attr) {
            return _serialize(this, attr || _serialize.DefaultAttr);
        };
    }
}(this));