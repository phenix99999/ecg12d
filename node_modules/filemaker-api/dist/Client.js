"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Client = void 0;
var Response_1 = require("./Response");
var axios_1 = __importDefault(require("axios"));
var qs_1 = __importDefault(require("qs"));
var Parser_1 = require("./Parser");
var Client = /** @class */ (function () {
    function Client(domain, db, getAuth) {
        this.domain = domain;
        this.db = db;
        this.getAuth = getAuth;
        this.rowsPerPage = 200;
    }
    Client.prototype.call = function (options) {
        return axios_1["default"](options)
            .then(function (axiosResponse) {
            return Parser_1.extractResponse(axiosResponse.data);
        })
            .then(function (xmlResponse) { return new Response_1.FMResponse(xmlResponse); });
    };
    Client.prototype.getDefaultOptions = function () {
        return {
            method: 'post',
            url: "https://" + this.domain + "/fmi/xml/fmresultset.xml",
            headers: {
                Authorization: this.getAuth()
            }
        };
    };
    Client.prototype.findall = function (layout, page, paginated,scriptOptions) {
        if (page === void 0) { page = 1; }
        if (paginated === void 0) { paginated = false; }
        var data = {
            '-db': this.db,
            '-lay': layout,
            '-findall': '1'
        };

        if (scriptOptions !== undefined) {
            data["-script"] = scriptOptions.script;
            if (scriptOptions.params !== undefined) {
                data["-script.param"] = scriptOptions.params.join('\n');
            }
        }
        /*
        if (paginated) {
            data['-skip'] = this.rowsPerPage * page;
            data['–relatedsets.max'] = this.rowsPerPage;
            data['-max'] = this.rowsPerPage;
        }
        */
        var options = __assign(__assign({}, this.getDefaultOptions()), { data: qs_1["default"].stringify(data) });
        return this.call(options);
    };
    Client.prototype.update = function (layout, recid, fields) {
        var data = __assign(__assign({}, fields), { '-recid': recid, '-db': this.db, '-lay': layout, '-edit': '' });
        var options = __assign(__assign({}, this.getDefaultOptions()), { data: qs_1["default"].stringify(data), method: 'POST' });
        return axios_1["default"](options)
            .then(function (response) {
            return Promise.resolve(Parser_1.extractResponse(response.data));
        });
    };
    Client.prototype.create = function (layout, fields, scriptOptions) {
    
        var data = __assign(__assign({}, fields), { '-db': this.db, '-lay': layout, '-new': '' });
        if (scriptOptions !== undefined) {
            data = { '-db': this.db, '-lay': layout, '-new': '' };
            data["-script"] = scriptOptions.script;
            if (scriptOptions.params !== undefined) {
                data["-script.param"] = scriptOptions.params.join('\n');
            }
        }
        var options = __assign(__assign({}, this.getDefaultOptions()), { data: qs_1["default"].stringify(data), method: 'POST' });
        return axios_1["default"](options)
            .then(function (response) {
            return Promise.resolve(Parser_1.extractResponse(response.data));
        });
    };
    Client.prototype.isAuthorized = function () {
        var data = {
            '-db': this.db,
            '-lay': 'asdflkjrandom',
            '-findall': '1'
        };
        var options = this.getDefaultOptions();
        options.url += '?' + qs_1["default"].stringify(data);
        options.validateStatus = function (status) { return true; };
        return axios_1["default"](options)
            .then(function (response) {
            console.log(response);
            return response.status !== 401;
        })["catch"](function (err) { return false; });
    };
    Client.prototype.customQuery = function (layout, fields) {
        if (fields === void 0) { fields = {}; }
        var sanFields = Object.keys(fields)
            .reduce(function (obj, key) {
            var _a;
            var value = fields[key];
            if (value === undefined)
                return obj;
            return __assign(__assign({}, obj), (_a = {}, _a[key] = value, _a));
        }, {});
        if (Object.keys(fields).length === 0)
            return this.findall(layout);
        var params = {};
        var counter = 0;
        var counters = [];
        var addField = function (value) {
            counter++;
            params["-q" + counter.toString()] = fieldName;
            params["-q" + counter.toString() + ".value"] = value;
            return counter;
        };
        for (var fieldName in sanFields) {
            var values = sanFields[fieldName];
            var fieldCounters = values.map(addField);
            counters.push(fieldCounters);
        }
        var lists = [
            []
        ];
        counters.forEach(function (fieldCounters) {
            lists = fieldCounters.reduce(function (duplicatedLists, counter) {
                var newLists = lists.map(function (list) { return list.concat([counter]); });
                return duplicatedLists.concat(newLists);
            }, []);
        });
        var query = lists
            .map(function (list) { return list.map(function (fieldCounter) { return "q" + fieldCounter; }).join(','); })
            .map(function (formula) { return "(" + formula + ")"; }).join(';');
        var data = __assign(__assign({}, params), { '-query': query, '-db': this.db, '-lay': layout, '–relatedsets.max': this.rowsPerPage, '-skip': 0, '-max': this.rowsPerPage, '-findquery': '' });
        //let options: AxiosRequestConfig = this.getDefaultOptions();
        //options.url += '?' + qs.stringify(data);
        var options = __assign(__assign({}, this.getDefaultOptions()), { method: 'POST', data: qs_1["default"].stringify(data) });
        return this.call(options);
    };
    return Client;
}());
exports.Client = Client;
