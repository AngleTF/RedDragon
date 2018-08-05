+function (wd) {
    'use strict';

    var thinkInstance = null,
        htmTag = /^<.+>$/,
        trim = /^\s+|\s+$/g,

        und = 'undefined',
        str = 'string',
        num = 'number',
        obj = 'object',
        fun = 'function',
        arr = 'array',
        boo = 'boolean',
        nan = 'NaN',
        Query = function () {
        },
        container = document.createElement('div'),
        version = '1.0',
        compatibility = 'IE8+',
        callArr = [],
        space = " ",


        LOG_E = 1,
        LOG_W = 2,
        LOG_I = 3;

    function RedDragon(select) {
        //'create instance';
        return (new Query).init(select);
    }

    //extend fun
    RedDragon.extend = function (target, extend) {
        var key;
        for (key in extend) {
            if (extend.hasOwnProperty(key)) {
                target[key] = extend[key];
            }
        }
    };

    //core method
    RedDragon.extend(Query.prototype, {
        constructor: Query,
        version: version,
        compatibility: compatibility,
        //init
        init: function (select) {
            this.nodeList = [];
            //clear dom object, add select and document loads callback fun
            RedDragon.registerEvent();
            return this.add(select).documentLoad(select);
        },
        //nodes fun
        //slice, delete, eq, first, last, add, version, each
        slice: function (start, length) {
            this.nodeList = this.nodeList.slice(start, length + start || this.nodeList.length);
            return this;
        },
        //The delete key cannot be used and IE8 reports an error
        del: function (start, length) {
            //default delete one
            this.nodeList.splice(start, length || 1);
            return this;
        },
        eq: function (id) {
            return this.slice(id, 1);
        },
        //first node
        first: function () {
            return this.eq(0);
        },
        //last node
        last: function () {
            return this.eq(-1);
        },
        //add of string, dom, domTag to nodes
        add: function (select) {
            if (!select) {
                //throws null, false, '', 0, NAN, undefined
                return this;
            }

            if (RedDragon.isStr(select)) {

                select = RedDragon.trim(select);

                if (htmTag.test(select)) {
                    //html document
                    container.innerHTML = select;
                    this.__push.apply(this, container.children);
                } else {
                    //search engine
                    try {
                        this.__push.apply(this, document.querySelectorAll(select));
                    } catch (e) {
                    }
                }
            } else if (RedDragon.isObj(select)) {
                //null, array, element, []
                if (RedDragon.isEle(select)) {
                    //html document

                    if (RedDragon.isUnd(select.length)) {
                        this.__push(select);
                    } else {
                        this.__push.apply(this, select);
                    }
                }
            }
            return this;
        },
        next: function (reversal) {
            var ele, arr = [];
            this.each(function () {
                if (ele = RedDragon.nextElement(this, reversal)) arr.push(ele)
            });
            return this.clear().add(arr);
        },
        nextAll: function (reversal) {
            var ele, arr = [];
            this.each(function () {
                if (ele = RedDragon.nextElementAll(this, reversal)) arr = arr.concat(ele)
            });
            return this.clear().add(arr);
        },
        prev: function () {
            return this.next(true);
        },
        prevAll: function () {
            return this.nextAll(true);
        },
        parent: function () {
            var ele, arr = [];
            this.each(function () {
                if (ele = RedDragon.parent(this)) arr.push(ele);
            });
            return this.clear().add(arr);
        },
        siblings: function () {
            var ele, arr = [];
            this.each(function () {
                if (ele = RedDragon.nextElementAll(this, true)) arr = arr.concat(ele);
                if (ele = RedDragon.nextElementAll(this, false)) arr = arr.concat(ele);
            });
            return this.clear().add(arr);
        },
        children: function () {
            var ele, arr = [];
            this.each(function () {
                if (ele = RedDragon.children(this)) arr = arr.concat(ele);
            });
            return this.clear().add(arr);
        },
        find: function (eleName) {
            var ele, nodes = this.getNodes(), self = this;
            this.clear();
            RedDragon.each(nodes, function () {
                if (ele = RedDragon.find(this, eleName)) self.add(ele);
            });
            return this;
        },
        clear: function () {
            return this.del(0, this.nodeList.length);
        },


        each: function (fun) {
            RedDragon.each(this.nodeList, fun);
            return this;
        },
        map: function (fun) {
            return RedDragon.map(this.nodeList, fun);
        },

        getNodes: function () {
            var nodesSource = [];
            nodesSource.push.apply(nodesSource, this.nodeList);
            return nodesSource;
        },
        __push: function () {
            //Filter duplicate labels
            var flag = true,
                self = this,
                that;

            RedDragon.each(arguments, function () {
                that = this;
                self.each(function () {
                    if (this === that) flag = false
                });
                that['eventList'] = that['eventList'] ? that['eventList'] : {};
                flag ? self.nodeList.push(that) : flag = true;
            });
        },
        //register document load event
        documentLoad: function (fun) {
            var self = this;
            if (RedDragon.isFun(fun)) {
                if (wd.addEventListener) {
                    document.addEventListener('DOMContentLoaded', fun)
                } else {
                    //fix IE8 document load
                    document.attachEvent('onreadystatechange', function () {
                        if (document.readyState === 'complete') fun.call(document)
                    })
                }
            }
            return this;
        },

        //dom fun
        //html, empty, remove, text,
        remove: function () {
            return this.each(function () {
                this.parentNode.removeChild(this);
            });
        },


        //set dom innerHTML, if type is function to get the content, call callback function and send array content to parameter
        html: function (content) {
            if (RedDragon.isFun(content)) {
                this.each(function () {
                    content.call(this, this.innerHTML);
                });
            } else if (RedDragon.isStr(content)) {
                this.each(function () {
                    this.innerHTML = content;
                });
            }
            return this;
        },
        //set dom innerText, if type is function to get the content, call callback function and send array content to parameter
        text: function (content) {
            if (RedDragon.isFun(content)) {
                this.each(function () {
                    content.call(this, this.innerText);
                });
            } else if (RedDragon.isStr(content)) {
                this.each(function () {
                    this.innerText = content;
                });
            }
            return this;
        },


        //clear dom innerHTML
        empty: function () {
            return this.html('');
        },


        //add to select tail and return select nodes
        tailTo: function (select, retain) {
            var oldNodes = this.getNodes(),
                self;

            this.init(select);
            return this.each(function (index) {
                self = this;
                RedDragon.each(oldNodes, function () {
                    self.appendChild(retain ? this.cloneNode(true) : (index === 0 ? this : this.cloneNode(true)))
                });
            });
        },
        //add to select front and return select nodes
        frontTo: function (select, retain) {
            var oldNodes = this.getNodes(),
                self;
            this.init(select);
            return this.each(function (index) {
                self = this;
                RedDragon.each(oldNodes, function () {
                    self.insertBefore(retain ? this.cloneNode(true) : (index === 0 ? this : this.cloneNode(true)), self.firstChild)
                });
            });
        },
        //add select to nodes tail
        tail: function (select) {
            var oldNodes;
            if (RedDragon.isStr(select)) {
                return this.each(function () {
                    this.innerHTML += select;
                })
            }
            oldNodes = this.getNodes();
            this.init(select);
            return this.tailTo(oldNodes)
        },
        //add select to nodes front
        front: function (select) {
            var oldNodes;
            if (RedDragon.isStr(select)) {
                return this.each(function () {
                    this.innerHTML = select + this.innerHTML;
                })
            }
            oldNodes = this.getNodes();
            this.init(select);
            return this.frontTo(oldNodes)
        },

        //attr
        attr: function (key, value) {
            if (RedDragon.isObj(key)) {
                //set attrs
                var k;
                for (k in key) {
                    this.each(function () {
                        this.setAttribute(k, key[k])
                    })
                }
            } else if (RedDragon.isFun(value)) {
                //get attr
                this.each(function () {
                    value.call(this, this.getAttribute(key));
                });
            } else {
                //set attr
                this.each(function () {
                    this.setAttribute(key, value)
                })
            }

            return this;
        },

        prop: function (key, value) {

            if (RedDragon.isObj(key)) {
                //set attrs
                var k;
                for (k in key) {
                    this.each(function () {
                        this[k] = key[k];
                    })
                }

            } else if (RedDragon.isFun(value)) {
                //get attr
                this.each(function () {
                    value.call(this, this[key]);
                });
            } else {
                //set attr
                this.each(function () {
                    this[key] = value;
                });
            }


            return this;
        },

        css: function (name, value) {
            if (RedDragon.isObj(name)) {
                //set styles
                var k;
                for (k in name) {
                    if (RedDragon.isLikeNum(name[k])) {
                        name[k] += 'px';
                    }
                    this.each(function () {
                        RedDragon.setCss(this, k, name[k]);
                    })
                }
            } else if (RedDragon.isFun(value)) {
                //get style
                this.each(function () {
                    value.call(this, RedDragon.getCss(this, name));
                });
            } else {
                //set style
                this.each(function () {
                    RedDragon.setCss(this, name, value);
                });
            }
            return this;
        },


        value: function (value) {
            return this.prop('value', value)
        },


        //addClass, removeClass, hasClass, showClass, toggleClass
        hasClass: function (className, fn) {
            var self = this;
            if (RedDragon.isFun(fn)) {
                this.each(function () {
                    fn.call(this, !!~self.nodeList.indexOf.call(this['classList'], className));
                });
            }
            return this;
        },

        addClass: function (className) {
            return this.hasClass(className, function (data) {
                if (!data) this.className = RedDragon.trim(RedDragon.trim(this.className) + space + className);
            });
        },

        removeClass: function (className) {
            var arr;
            return this.each(function () {
                arr = RedDragon.getClassList(this);
                arr.forEach(function (current, index) {
                    if (className === current) arr.splice(index, 1);
                });
                this.className = arr.join(space);
            })
        },

        showClass: function (fn) {
            if (RedDragon.isFun(fn)) {
                this.each(function () {
                    fn.call(this, RedDragon.getClassList(this))
                })
            }
            return this;
        },

        toggleClass: function (className) {
            var self = this;
            return this.hasClass(className, function (data) {
                data ? self.removeClass(className) : self.addClass(className);
            });
        },


        addEvent: function (eventName, fn) {
            return this.each(function () {
                RedDragon.addEvent(this, eventName, fn);
            });
        },
        removeEvent: function (eventName, fn) {
            return this.each(function () {
                RedDragon.removeEvent(this, eventName, fn);
            });
        }
    });

    //RedDragon static fun
    RedDragon.extend(RedDragon, {
        each: function (ele, fn) {
            var key, len;
            if (ele instanceof Array) {
                for (key = 0, len = ele.length; key < len; key++) {
                    if (fn.call(ele[key], key) === false) break;
                }
            } else {
                for (key in ele) {
                    if (ele.hasOwnProperty) {
                        if (ele.hasOwnProperty(key)) if (fn.call(ele[key], key) === false) break;
                    } else {
                        //IE8 not iterated prototype but length is iterated
                        if (key === 'length') continue;
                        if (fn.call(ele[key], key) === false) break;
                    }
                }
            }
            /*
            *   //IE8 不支持 hasOwnProperty
                if (ele instanceof Array) {
                    for (key = 0, len = ele.length; key < len; key++) {
                            if (fn.call(ele[key], key) === false) break;
                    }
                } else {
                    for (key in ele) {
                        if (ele.hasOwnProperty(key)) if (fn.call(ele[key], key) === false) break;
                    }
                }
            *
            * */
        },
        map: function (arr, fun) {
            var result = [];
            this.each(arr, function (index) {
                result.push(fun.call(this, index));
            });
            return result;
        },

        trim: function (str) {
            if (!RedDragon.isUnd(str.trim)) return str.trim();
            return str.replace(trim, '');
        },

        //node
        nextElement: function (ele, reversal) {
            var sibling = reversal ? ele.previousSibling : ele.nextSibling;
            if (sibling && sibling.nodeType !== 1) {
                return this.nextElement(sibling, reversal)
            }
            return sibling;
        },
        nextElementAll: function (ele, reversal) {
            var sibling = ele, arr = [];
            while (sibling = RedDragon.nextElement(sibling, reversal)) {
                arr.push(sibling)
            }
            return arr;
        },
        parent: function (ele) {
            return ele.parentNode
        },
        children: function (ele) {
            var arr = [], child = ele.childNodes;
            if (child) {
                this.each(child, function () {
                    if (RedDragon.isNode(this)) arr.push(this)
                });
            }
            return arr;
        },
        find: function (ele, findEleName) {
            return ele.querySelectorAll(findEleName);
        },
        //types judge
        isFun: function (select) {
            return typeof select === fun;
        },
        isArr: function (select) {
            return select instanceof Array;
        },
        isLikeArr: function (select) {
            if (!select) return false;
            return typeof select !== str
                && typeof select !== num
                && typeof select !== fun
                && select !== wd
                && (select instanceof Array || typeof select['length'] !== und)
                && select.length > 0
        },
        isObj: function (select) {
            return typeof select === obj && select !== null;
        },
        isStr: function (select) {
            return typeof select === str;
        },
        isNum: function (select) {
            return typeof select === num;
        },
        isLikeNum: function (select) {
            return select == new Number(select);
        },
        isBoo: function (select) {
            return typeof select === boo;
        },
        isUnd: function (select) {
            return typeof select === und;
        },
        isNil: function (select) {
            return select === null;
        },
        isNaN: function (select) {
            return typeof select === num && select.toString() === nan;
        },
        isNode: function (ele) {
            return ele.nodeType === 1;
            //return ele instanceof Element
        },
        isEle: function (ele) {
            var flag = true;

            if (RedDragon.isLikeArr(ele)) {

                this.each(ele, function () {
                    if (!RedDragon.isNode(this)) flag = false
                })
            } else {
                if (!RedDragon.isNode(ele)) flag = false
            }
            return flag;
        },


        //extend plug
        addPlugins: function (extend) {
            RedDragon.extend(Query.prototype, extend);
        },


        dumpInfo: function (val, type, isO) {
            switch (type) {
                case LOG_E:
                    isO ? console.error('%O', val) : console.error(val);
                    break;
                case LOG_W:
                    isO ? console.warn('%O', val) : console.warn(val);
                    break;
                default:
                case LOG_I:
                    isO ? console.log('%O', val) : console.log(val);
            }
        },
        dump: function (args, type) {
            var val, key;

            for (key in args) {
                val = args[key];
                switch (true) {
                    case RedDragon.isNil(val):
                        console.clear();
                        break;
                    case RedDragon.isArr(val) && console.table:
                        console.table(val);
                        break;
                    case RedDragon.isFun(val) || RedDragon.isObj(val):
                        RedDragon.dumpInfo(val, type, true);
                        break;
                    default:
                        RedDragon.dumpInfo(val, type, false);
                }
            }
        },
        //console print logs
        info: function () {
            RedDragon.dump(arguments, LOG_I)
        },
        err: function () {
            RedDragon.dump(arguments, LOG_E)
        },
        warn: function () {
            RedDragon.dump(arguments, LOG_W)
        },

        //css
        getCss: function (element, style) {
            return wd.getComputedStyle ? getComputedStyle(element)[style] : element.currentStyle[style]
        },
        setCss: function (element, name, value) {
            element.style[name] = value;
        },


        first: function (data) {
            return data[0];
        },

        getClassList: function (ele) {
            return RedDragon.trim(ele.className).split(space)
        },

        floatEqual: function (f1, f2) {
            return Math.abs(f1 - f2) < Number.EPSILON;
        },
        ajaxSettings: function () {
            return {
                method: 'GET',
                data: {},
                async: true,
                url: '',
                type: '',
                success: function () {
                },
                failure: function () {
                },
                upload: function () {
                },
                header: {
                    "Content-type": "application/x-www-form-urlencoded",
                }
            }
        },
        ajaxPlant: function (settings) {
            var newSeeings = this.ajaxSettings(),
                data;

            RedDragon.extend(newSeeings, settings);

            this.toUpper(newSeeings, ['type', 'method']);
            data = this.requestString(newSeeings['data']);

            if (newSeeings['method'] === 'GET') {
                newSeeings['url'] += '?' + data;
                newSeeings['data'] = null;
            } else {
                newSeeings['data'] = data;
            }

            return newSeeings;
        },
        ajax: function (settings) {

            var oXml = new XMLHttpRequest();
            settings = this.ajaxPlant(settings);
            oXml.open(settings.method, settings.url, settings.async);

            this.addEvent(oXml, 'readystatechange', function () {
                if (oXml.readyState === 4 && oXml.status >= 200 && oXml.status < 300) {
                    switch (settings.type) {
                        case 'XML':
                            settings.success(oXml.responseXML);
                            break;
                        case 'JSON':
                            settings.success(JSON.parse(oXml.responseText));
                            break;
                        //case 'STREAM':
                        //    settings.success(oXml.responseStream);
                        //    break;
                        default:
                            settings.success(oXml.responseText);
                    }
                } else if (oXml.status >= 300 && oXml.readyState === 4) {
                    //如果失败返回对象本身
                    settings.failure(oXml);
                }
            });

            this.each(settings.header, function (key) {
                oXml.setRequestHeader(key, this);
            });

            oXml.send(settings.data);
        },

        requestString: function (data) {
            var str = '';
            this.each(data, function (key) {
                str += (str ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(this);
            });

            return str;
        },

        toUpper: function (target, types) {
            var self = this;
            self.each(target, function (index) {
                self.each(types, function () {
                    if (index === this) target[index] = target[index].toUpperCase()
                })
            });
        },
        toLower: function (target, types) {
            var self = this;
            self.each(target, function (index) {
                self.each(types, function () {
                    if (index === this) target[index] = target[index].toLowerCase()
                })
            });
        },

        registerEvent: function () {
            if (window.addEventListener) {
                this.eventDrive = function (ele, event) {
                    ele.addEventListener(event, function (e) {
                        RedDragon.each(ele.eventList[event], function () {
                            this.call(ele, e)
                        })
                    });
                }
            } else if (window.attachEvent) {
                this.eventDrive = function (ele, event) {
                    ele.attachEvent('on' + event, function (e) {
                        RedDragon.each(ele.eventList[event], function () {
                            this.call(ele, e)
                        })
                    })
                }
            } else {
                this.eventDrive = function (ele, event) {
                    ele['on' + event] = function () {
                        RedDragon.each(ele.eventList[event], function () {
                            this.call(ele, window.event)
                        })
                    }
                }
            }
        },
        eventDrive: null,

        addEvent: function (ele, eventName, fn) {
            var eventList = ele['eventList'] || (ele['eventList'] = {});

            if (eventList[eventName]) {
                eventList[eventName].push(fn)
            } else {
                eventList[eventName] = [fn];
                RedDragon.eventDrive(ele, eventName)
            }
        },
        removeEvent: function (ele, eventName, fn) {
            var eventList = ele['eventList'], index;

            if (eventList[eventName]) {
                index = eventList[eventName].indexOf(fn);
                if (!!~index) eventList[eventName].splice(index, 1);
            }
        }
    });

    //register entrance
    RedDragon.extend(wd, {
        RedDragon: RedDragon,
        info: RedDragon.info,
        err: RedDragon.err,
        warn: RedDragon.warn,
    })

}(window);