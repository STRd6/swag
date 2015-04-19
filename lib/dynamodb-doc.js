

/**
 * Creates an instance of Condition that is used by the DynamoDB Document client.
 *
 * @param {string} key The attribute name being conditioned on.
 * @param {string} operator The operator in the conditional clause. (See aws sdk docs for full list of operators)
 * @param val<n> Potential <n>nd element in what would be the AttributeValueList (optional)
 * @return {Condition} Condition for your DynamoDB request.
 */
function DynamoDBCondition(key, operator) { /* and variable arguments. */
    var datatypes = typeof(window) === "undefined" ? require("./datatypes").DynamoDBDatatype
                : window.DynamoDBDatatype;

    var t = new datatypes();

    var args = Array.prototype.slice.call(arguments, 2);

    var CondObj = function Condition(key, operator, args) {
            this.key = key;
            this.operator = operator;
            this.args = args;

            // for comatibility
            this.val1 = args[0];
            this.val2 = args[1];

            this.format = function() {
                var formatted = {};
                var attrValueList = [];

                for (var i=0; i<this.args.length; i++) {
                    if (this.args[i] !== undefined) {
                        attrValueList.push(t.formatDataType(this.args[i]));
                    }
                }
                if (attrValueList.length > 0) {
                    formatted.AttributeValueList = attrValueList;
                }
                formatted.ComparisonOperator = this.operator;

                return formatted;
            };
    };

    var cond = new CondObj(key, operator, args);
    cond.prototype = Object.create(Object.prototype);
    cond.prototype.instanceOf  = "DynamoDBConditionObject";

    return cond;
}

if (typeof(module) !== "undefined") {
    var exports = module.exports = {};
    exports.DynamoDBCondition = DynamoDBCondition;
}

window.DynamoDBCondition = DynamoDBCondition;


/**
 * @class Creates a DynamoDBDatatype that takes care of all datatype handling.
 *
 * @name DynamoDBDatatype
 */
function DynamoDBDatatype() {
    var AWS = typeof(window) === "undefined" ? require("aws-sdk") : window.AWS;
    var Uint8ArrayError = "Uint8Array can only be used for Binary in Browser.";
    var ScalarDatatypeError = "Unrecognized Scalar Datatype to be formatted.";
    var GeneralDatatypeError = "Unrecognized Datatype to be formatted.";
    var BinConversionError = "Need to pass in Buffer or Uint8Array. ";
    var StrConversionError = "Need to pass in string primitive to be converted to binary.";

    function isScalarType(dataType) {

        var type = typeof(dataType);
        return  type === "number"  ||
                type === "string"  ||
                type === "boolean" ||
                (dataType instanceof(Uint8Array) && AWS.util.isBrowser()) ||
                dataType instanceof(AWS.util.Buffer) ||
                dataType === null;
    }

    function isSetType(dataType) {
        return dataType.datatype === "SS" ||
                dataType.datatype === "NS" ||
                dataType.datatype === "BS";
    }

    function isRecursiveType(dataType) {

        return Array.isArray(dataType) ||
                typeof(dataType) === "object";
    }

    function formatSetValues(datatype, values) {
        if(datatype === "NS") {
            return values.map(function (n) {
                return n.toString();
            });
        } else {
          return values;
        }
    };

    function formatRecursiveType(dataType) {

        var recursiveDoc = {};

        var value = {};
        var type = "M";
        if (Array.isArray(dataType)) {
            value = [];
            type = "L";
        }

        for (var key in dataType) {
            value[key] = this.formatDataType(dataType[key]);
        }

        recursiveDoc[type] = value;
        return recursiveDoc;
    }

    /** @throws Uint8ArrayError, ScalarDatatypeError
     *  @private */
    function formatScalarType(dataType) {

        if (dataType == null) {
            return { "NULL" : true };
        }

        var type = typeof(dataType);
        if (type === "string") {
            return { "S" : dataType };
        } else if (type === "number") {
            return { "N" : String(dataType) };
        } else if (type === "boolean") {
            return { "BOOL" : dataType };
        } else if (dataType instanceof(AWS.util.Buffer)) {
            return { "B" : dataType };
        } else if (dataType instanceof(Uint8Array)) {
            if (AWS.util.isBrowser()) {
                return { "B" : dataType };
            } else {
                throw new Error(Uint8ArrayError);
            }
        } else {
            throw new Error(ScalarDatatypeError);
        }
    }

    /**
     * Formats Javascript datatypes into DynamoDB wire format.
     *
     * @name formatDataType
     * @function
     * @memberOf DynamoDBDatatype#
     * @param dataType Javascript datatype (i.e. string, number. For full information, check out the README).
     * @return {object} DynamoDB JSON-like wire format.
     * @throws GeneralDatatypeError
     */
    this.formatDataType = function(dataType) {

        if (isScalarType(dataType)) {
            return formatScalarType(dataType);
        } else if (isSetType(dataType)) {
            return dataType.format();
        } else if (isRecursiveType(dataType)) {
            return formatRecursiveType.call(this, dataType);
        }  else {
            throw new Error(GeneralDatatypeError);
        }

    };

    function str2Bin(value) {
        if (typeof(value) !== "string") {
            throw new Error(StrConversionError);
        }

        if (AWS.util.isBrowser()) {
            var len = value.length;
            var bin = new Uint8Array(new ArrayBuffer(len));
            for (var i = 0; i < len; i++) {
                bin[i] = value.charCodeAt(i);
            }
            return bin;
        } else {
            return AWS.util.Buffer(value);
        }
    }

    /**
     * Utility to convert a String to a Binary object.
     *
     * @function strToBin
     * @memberOf DynamoDBDatatype#
     * @param {string} value String value to converted to Binary object.
     * @return {object} (Buffer | Uint8Array) depending on Node or browser.
     * @throws StrConversionError
     */
    this.strToBin = function(value) {
        return str2Bin.call(this, value);
    };

    function bin2Str(value) {
        if (!(value instanceof(AWS.util.Buffer)) && !(value instanceof(Uint8Array))) {
            throw new Error(BinConversionError);
        }

        if (AWS.util.isBrowser()) {
            return String.fromCharCode.apply(null, value);
        } else {
            return value.toString("utf-8").valueOf();
        }
    }

    /**
     * Utility to convert a Binary object into a decoded String.
     *
     * @function binToStr
     * @memberOf DynamoDBDatatype#
     * @param {object} value Binary value (Buffer | Uint8Array) depending on Node or browser.
     * @return {string} decoded String in UTF-8
     * @throws BinConversionError
     */
    this.binToStr = function(value) {
        return bin2Str.call(this, value);
    };

    /**
     * Utility to create the DynamoDB Set Datatype.
     *
     * @function createSet
     * @memberOf DynamoDBDatatype#
     * @param {array} set An array that contains elements of the same typed as defined by {type}.
     * @param {string} type Can only be a [S]tring, [N]umber, or [B]inary type.
     * @return {Set} Custom Set object that follow {type}.
     * @throws InvalidSetType, InconsistentType
     */
    this.createSet = function(set, type) {
        if (type !== "N" && type !== "S" && type !== "B") {
            throw new Error(type + " is an invalid type for Set");
        }

        var setObj = function Set(set, type) {
            this.datatype = type + "S";
            this.contents = {};

            this.add = function(value) {
                if (this.datatype === "SS" && typeof(value) === "string") {
                    this.contents[value] = value;
                } else if (this.datatype === "NS" && typeof(value) === "number") {
                    this.contents[value] = value;
                } else if (this.datatype === "BS" && value instanceof(AWS.util.Buffer)) {
                    this.contents[bin2Str(value)] = value;
                } else if (this.datatype === "BS" && value instanceof(Uint8Array)) {
                    if (AWS.util.isBrowser()) {
                        this.contents[bin2Str(value)] = value;
                    } else {
                        throw new Error(Uint8ArrayError);
                    }
                } else {
                    throw new Error("Inconsistent in this " + type + " Set");
                }
            };

            this.contains = function(content) {
                var value = content;
                if (content instanceof AWS.util.Buffer || content instanceof(Uint8Array)) {
                    value = bin2Str(content);
                }
                if (this.contents[value] === undefined) {
                    return false;
                }
                return true;
            };

            this.remove = function(content) {
                var value = content;
                if (content instanceof AWS.util.Buffer || content instanceof(Uint8Array)) {
                    value = bin2Str(content);
                }
                delete this.contents[value];
            };

            this.toArray = function() {
                var keys = Object.keys(this.contents);
                var arr = [];

                for (var keyIndex in keys) {
                    var key = keys[keyIndex];
                    if (this.contents.hasOwnProperty(key)) {
                        arr.push(this.contents[key]);
                    }
                }

                return arr;
            };

            this.format = function() {
                var values = this.toArray();
                var result = {};
                result[this.datatype] = formatSetValues(this.datatype, values);
                return result;
            };

            if (set) {
                for (var index in set) {
                    this.add(set[index]);
                }
            }
        };

        return new setObj(set, type);
    };

    /**
     * Formats DynamoDB wire format into javascript datatypes.
     *
     * @name formatWireType
     * @function
     * @memberOf DynamoDBDatatype#
     * @param {string} key Key that represents the type of the attribute value
     * @param value Javascript datatype of the attribute value produced by DynamoDB
     * @throws GeneralDatatypeError
     */
    this.formatWireType = function(key, value) {
        switch (key) {
            case "S":
            case "B":
            case "BOOL":
                return value;
            case "N":
                return Number(value);
            case "NULL":
                return null;
            case "L":
                for (var lIndex = 0; lIndex < value.length; lIndex++) {
                    var lValue = value[lIndex];
                    var lKey = Object.keys(lValue)[0];
                    value[lIndex] = this.formatWireType(lKey, lValue[lKey]);
                }
                return value;
            case "M":
                for (var mIndex in value) {
                    var mValue = value[mIndex];
                    var mKey = Object.keys(mValue)[0];
                    value[mIndex] = this.formatWireType(mKey, mValue[mKey]);
                }
                return value;
            case "SS":
                return new this.createSet(value, "S");
            case "NS":
                value = value.map(function(each) { return Number(each);});
                return new this.createSet(value, "N");
            case "BS":
                return new this.createSet(value, "B");
            default:
                throw "Service returned unrecognized datatype " + key;
        }
    }
}

if (typeof(module) !== "undefined") {
    var exports = module.exports = {};
    exports.DynamoDBDatatype = DynamoDBDatatype;
}

window.DynamoDBDatatype = DynamoDBDatatype;


/**
 * Create an instance of the DynamoDB Document client.
 *
 * @constructor
 * @class DynamoDB
 * @param {AWS.DynamoDB} dynamoDB An instance of the service provided AWS SDK (optional).
 * @returns {DynamoDB} Modified version of the service for Document support.
 */
function DynamoDB(dynamoDB) {
    var isBrowser = typeof(window) === "undefined";
    var AWS = isBrowser ? require("aws-sdk") : window.AWS;

    var condition = isBrowser ? require("./condition").DynamoDBCondition : window.DynamoDBCondition;

    var datatypes = isBrowser ? require("./datatypes").DynamoDBDatatype : window.DynamoDBDatatype;
    var t = new datatypes();

    var formatter = isBrowser ? require("./formatter").DynamoDBFormatter : window.DynamoDBFormatter;
    var f = new formatter();

    var service = dynamoDB || new AWS.DynamoDB();

    var setupLowLevelRequestListeners = service.setupRequestListeners;
    service.setupRequestListeners = function(request) {
        setupLowLevelRequestListeners.call(this, request);

        request._events.validate.unshift(f.formatInput);
        request.on("extractData", f.formatOutput);
    };

    /**
     * Utility to create Set Object for requests.
     *
     * @function Set
     * @memberOf DynamoDB#
     * @param {array} set An array that contains elements of the same typed as defined by {type}.
     * @param {string} type Can only be a [S]tring, [N]umber, or [B]inary type.
     * @return {Set} Custom Set object that follow {type}.
     * @throws InvalidSetType, InconsistentType
     */
    service.__proto__.Set = function(set, type) {
        return t.createSet(set, type);
    };

    /**
    * Creates an instance of Condition and should be used with the DynamoDB client.
    *
    * @function Condition
    * @memberOf DynamoDB#
    * @param {string} key The attribute name being conditioned.
    * @param {string} operator The operator in the conditional clause. (See lower level docs for full list of operators)
    * @param val1 Potential first element in what would be the AttributeValueList
    * @param val* Potential *nd element in what would be the AttributeValueList (optional)
    * @return {Condition} Condition for your DynamoDB request.
    */
    service.__proto__.Condition = function(/*key, operator, val1, val2, ...*/) {
        return condition.apply(this, arguments);
    };

    /**
     * Utility to convert a String to the necessary Binary object.
     *
     * @function StrToBin
     * @memberOf DynamoDB#
     * @param {string} value String value to converted to Binary object.
     * @return {object} Return value will be a Buffer or Uint8Array in the browser.
     * @throws StrConversionError
     */
    service.__proto__.StrToBin = function(value) {
        return t.strToBin(value);
    };
    /**
     * Utility to convert a Binary object into its String equivalent.
     *
     * @function BinToStr
     * @memberOf DynamoDB#
     * @param {object} value Binary value (Buffer | Uint8Array) depending on environment.
     * @return {string} Return value will be the string representation of the Binary object.
     * @throws BinConversionError
     */
    service.__proto__.BinToStr = function(value) {
        return t.binToStr(value);
    };

    return service;
}

if (typeof(module) !== "undefined") {
    var exports = module.exports = {};
    exports.DynamoDB = DynamoDB;
}

window.DynamoDB = DynamoDB;


/**
 *  Create an instance of the DynamoDBFormatter.
 *  @constructor
 *  @return {DynamoDBFormatter} A Formatter object that provides methods for formatting DynamoDB requests and responses.
 */
function DynamoDBFormatter() {
    var datatypes = typeof(window) === "undefined" ? require("./datatypes").DynamoDBDatatype : window.DynamoDBDatatype;
    var t = new datatypes();
    var EmptyConditionArray = "Need to pass in an array with 1 or more Condition Objects.";
    var BadElementInConditionArray = "Only Condition objects are allowed as members of the array.";
    var InvalidCondition = "Need to pass in a valid Condition Object.";

    function formatAttrValInput(attrValueMap) {
        var attributeValueMap = {};
        for (var attr in attrValueMap) {
            var value = attrValueMap[attr];
            attributeValueMap[attr] = t.formatDataType(value);
        }
        return attributeValueMap;
    }

    function formatConditions(conditions) {
        if (conditions.prototype && conditions.prototype.instanceOf === "DynamoDBConditionObject") {
            conditions = [conditions];
        } else {
            if (Array.isArray(conditions)) {
                if (conditions.length === 0) {
                    throw new Error(EmptyConditionArray);
                }
                for (var index in conditions) {
                    var condition = conditions[index];
                    if (!(condition.prototype) || !(condition.prototype.instanceOf === "DynamoDBConditionObject")) {
                        throw new Error(BadElementInConditionArray);
                    }
                }
            } else {
                throw new Error(InvalidCondition);
            }
        }

        var expected = {};
        for (var index in conditions) {
            var condition = conditions[index];
            expected[condition.key] = condition.format();
        }
        return expected;
    }

    function formatUpdates(updates) {
        var attrUpdates = {};
        for (var attr in updates) {
            if (updates.hasOwnProperty(attr)) {
                var actionValue = {};
                var value = updates[attr].Value;
                var action = updates[attr].Action;

                actionValue.Action = action;
                if (value !== undefined) {
                    actionValue.Value = t.formatDataType(value);
                }
                attrUpdates[attr] = actionValue;
            }
        }

         return attrUpdates;
    }

    function handleWriteRequest(request) {
        var requestCopy = {};

        if (request.DeleteRequest) {
            var key = request.DeleteRequest.Key;
            requestCopy.DeleteRequest = {};
            requestCopy.DeleteRequest.Key = formatAttrValInput(key);
        } else {
            var item = request.PutRequest.Item;
            requestCopy.PutRequest = {};
            requestCopy.PutRequest.Item = formatAttrValInput(item);
        }

        return requestCopy;
    }

    function formatRequestItems(requests) {
        var requestItems = {};

        for (var table in requests) {
            if (requests.hasOwnProperty(table)) {
                requestItems[table] = {};

                var request = requests[table];
                if (Array.isArray(request)) {
                    var writeRequests = [];
                    for (var wIndex in request) {
                        writeRequests.push(handleWriteRequest(request[wIndex]));
                    }
                    requestItems[table] = writeRequests;
                } else {
                    if (request.AttributesToGet) {
                        requestItems[table].AttributesToGet = request.AttributesToGet;
                    }
                    if (request.ConsistentRead) {
                        requestItems[table].ConsistentRead = request.ConsistentRead;
                    }
                    if (request.ProjectionExpression) {
                        requestItems[table].ProjectionExpression = request.ProjectionExpression;
                    }
                    if (request.ExpressionAttributeNames) {
                        requestItems[table].ExpressionAttributeNames = request.ExpressionAttributeNames;
                    }
                    if (request.Keys) {
                        var keys = [];
                        for (var gIndex in request.Keys) {
                            var key = request.Keys[gIndex];
                            keys.push(formatAttrValInput(key));
                        }
                        requestItems[table].Keys = keys;
                    }
                }
            }
        }

        return requestItems;
    }

    var inputMap = { "AttributeUpdates": formatUpdates,
                     "ExclusiveStartKey": formatAttrValInput,
                     "Expected": formatConditions,
                     "ExpressionAttributeValues": formatAttrValInput,
                     "Item": formatAttrValInput,
                     "Key": formatAttrValInput,
                     "KeyConditions": formatConditions,
                     "RequestItems": formatRequestItems,
                     "ScanFilter": formatConditions,
                     "QueryFilter": formatConditions};


    function formatAttrValOutput(item) {
        var attrList = {};
        for (var attribute in item) {
            var keys = Object.keys(item[attribute]);
            var key = keys[0];
            var value = item[attribute][key];

            value = t.formatWireType(key, value);
            attrList[attribute] = value;
        }

        return attrList;
    }

    function formatItems(items) {
        for (var index in items) {
            items[index] = formatAttrValOutput(items[index]);
        }
        return items;
    }

    function handleCollectionKey(metrics) {
        var collectionKey = metrics.ItemCollectionKey;
        metrics.ItemCollectionKey = formatAttrValOutput(collectionKey);
        return metrics;
    }

    function handleBatchMetrics(metrics) {
        for (var table in metrics) {
            if (metrics.hasOwnProperty(table)) {
                var listOfKeys = metrics[table];
                for (var index in listOfKeys) {
                    listOfKeys[index] = handleCollectionKey(listOfKeys[index]);
                }
            }
        }
        return metrics;
    }

    function formatMetrics(metrics) {
        var collectionKey = metrics.ItemCollectionKey;
        if (collectionKey) {
            metrics = handleCollectionKey(metrics);
        } else {
            metrics = handleBatchMetrics(metrics);
        }
        return metrics;
    }

    function formatResponses(responses) {
        for (var table in responses) {
            if (responses.hasOwnProperty(table)) {
                var listOfItems = responses[table];
                for (var index in listOfItems) {
                    listOfItems[index] = formatAttrValOutput(listOfItems[index]);
                }
            }
        }

        return responses;
    }

    function formatUnprocessedItems(unprocessedItems) {
        for(var table in unprocessedItems) {
            if (unprocessedItems.hasOwnProperty(table)) {
                var tableInfo = unprocessedItems[table];
                for (var index in tableInfo) {
                    var request = tableInfo[index];
                    if (request.DeleteRequest) {
                        tableInfo[index].DeleteRequest.Key = formatAttrValOutput(request.DeleteRequest.Key);
                    } else {
                        tableInfo[index].PutRequest.Item = formatAttrValOutput(request.PutRequest.Item);
                    }
                }
            }
        }
        return unprocessedItems;
    }

    function formatUnprocessedKeys(unprocessedKeys) {
        for (var table in unprocessedKeys) {
            if (unprocessedKeys.hasOwnProperty(table)) {
                var tableInfo = unprocessedKeys[table];
                var listOfKeys = tableInfo.Keys;
                for (var index in listOfKeys) {
                    tableInfo.Keys[index] = formatAttrValOutput(listOfKeys[index]);
                }
            }
        }

        return unprocessedKeys;
    }

    /**
     * DynamoDBFormatter specifically for wrapping DynamoDB response objects.
     *
     * @function formatOutput
     * @memberOf DynamoDBFormatter#
     * @params {object} response Response object directly passed out by the service.
     * @returns {object} Wrapped up response object.
     */
    this.formatOutput = function(response) {
        var outputMap = {"Attributes": formatAttrValOutput,
                         "Item": formatAttrValOutput,
                         "Items": formatItems,
                         "ItemCollectionMetrics": formatMetrics,
                         "LastEvaluatedKey": formatAttrValOutput,
                         "Responses": formatResponses,
                         "UnprocessedKeys": formatUnprocessedKeys,
                         "UnprocessedItems": formatUnprocessedItems};


        var data = response.data;
        if (data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var formatFunc = outputMap[key];
                    if (formatFunc) {
                        response.data[key] = formatFunc(data[key]);
                    }
                }
            }
        }
    };

    /**
     * DynamoDBFormatter specifically for unwrapping DynamoDB request objects.
     *
     * @function formatInput
     * @memberOf DynamoDBFormatter#
     * @params {object} request Request object created by the service.
     * @return {object} Returns aws sdk version of the request.
     */
    this.formatInput = function (request) {
        var paramsCopy = {};
        var params = request.params;

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var param = params[key];
                var formatFunc = inputMap[key];
                if (formatFunc) {
                    param = formatFunc(param);
                }
                paramsCopy[key] = param;
            }
        }

        request.params = paramsCopy;
    };
}

if (typeof(module) !== "undefined") {
    var exports = module.exports = {};
    exports.DynamoDBFormatter = DynamoDBFormatter;
}

window.DynamoDBFormatter = DynamoDBFormatter;
