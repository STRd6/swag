(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2015 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "# swag\nServerless Working Applications Group\n",
      "mode": "100644",
      "type": "blob"
    },
    "aws.coffee": {
      "path": "aws.coffee",
      "content": "\n# Add logins when creating Cognito credentials\n# http://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html\n# http://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html#updating-the-logins-map\n# Once you obtain an identity ID and session token from your backend, you will\n# to pass them into the AWS.CognitoIdentityCredentials provider. Here's an example:\n#AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n   #IdentityPoolId: 'IDENTITY_POOL_ID',\n   #IdentityId: 'IDENTITY_ID_RETURNED_FROM_YOUR_PROVIDER',\n   #Logins: {\n      #'cognito-identity.amazonaws.com': 'TOKEN_RETURNED_FROM_YOUR_PROVIDER'\n   #}\n#});\n\nlog = (obj, rest...) ->\n  console.log obj, rest...\n  return obj\n\npinvoke = (object, method, params...) ->\n  new Promise (resolve, reject) ->\n    object[method] params..., (err, result) ->\n      if err\n        reject err \n        return\n\n      resolve result\n\nSHA = require \"./lib/sha\"\n\nAWS.config.update({region: 'us-east-1'})\n\nAWS.config.credentials = new AWS.CognitoIdentityCredentials\n  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n\nuploadToS3 = (bucket, file, key) ->\n  params =\n    Key: key\n    ContentType: file.type\n    Body: file\n    # ACL: 'public-read'\n\n  pinvoke bucket, \"putObject\", params\n\nwriteToDynamoDB = (table, id, path, sha) ->\n  time = \"#{+new Date}\"\n\n  # Write the item to the table\n  params =\n    Item:\n      owner: {S: id}\n      path: {S: path}\n      created_at: {S: time}\n      sha: {S: sha}\n\n  pinvoke table, \"putItem\", params\n\nqueryDynamoDB = (table, id) ->\n  table = table\n\n  params =\n    AttributesToGet: [\n      \"path\"\n      \"sha\"\n    ]\n    KeyConditions:\n      owner:\n        ComparisonOperator: \"EQ\"\n        AttributeValueList: [S: id]\n\n  pinvoke table, \"query\", params\n\nreadFromDynamoDB = (id, path) ->\n  params = \n    Key:\n      owner: {S: id}\n      path: {S: path}\n\n  # Read the item from the table\n  pinvoke table, \"getItem\", params\n\nuploadFile = (table, bucket, id, file, path) ->\n\n  SHA file\n  .then (sha) ->\n    s3Key = \"#{id}/#{sha}\"\n\n    Promise.all [\n      uploadToS3(bucket, file, s3Key)\n      writeToDynamoDB(table, id, path, sha)\n    ]\n\ndo ->\n  table = new AWS.DynamoDB\n    params:\n      TableName: 'whimsy-fs'\n\n  bucket = new AWS.S3\n    params:\n      Bucket: \"whimsy-fs\"\n\n  file = new File [\"yolo\"], \"filename.txt\", {type: \"text/plain\"}\n\n  pinvoke AWS.config.credentials, \"get\"\n  .then ->\n    id = AWS.config.credentials.identityId\n\n    uploadFile(table, bucket, id, file, \"/test/file.txt\")\n    .catch (e) ->\n      console.error e\n    .then ->\n      queryDynamoDB(table, id)\n    .then log\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "\\*S\\*W\\*A\\*G\\*\n\nLet's use AWS Cognitor to be all serverless all the time!\n\n    require \"./aws\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "remoteDependencies: [\n  \"https://sdk.amazonaws.com/js/aws-sdk-2.2.42.min.js\"\n]\n",
      "mode": "100644",
      "type": "blob"
    },
    "whimsy-fs.md": {
      "path": "whimsy-fs.md",
      "content": "Whimsy FS\n=========\n\nDynamoDB Semantic Records linking to S3 Content Addressable Store\n\nDynamoDB Table\n\n      Primary keys     Index    Link to CAS\n        |       |        |           |\n    +-------+------+-----------+----------+------------------------\n    | owner | path | createdAt |    sha   |  extra... (tags, etc.)\n\n\nSaving a File\n-------------\n\nsha is base64 url-encoded sha256 of file contents\n\nCompute sha, save to S3 and DynamoDB\n\nS3 path is \"${cognito-identity.amazonaws.com:sub}/#{sha}\"\n\nDynamoDB path is logical path ex: /Desktop/yolo.png\nowner is \"${cognito-identity.amazonaws.com:sub}\"\ncreatedAt number: unix epoch timestamp\nsha is the same sha that matches s3\narbitrary extra meta data can be added\n\nurls can be constructed by\n\n       https://s3.amazonaws.com/#{bucket}/#{userId}/#{sha}\n    -> https://#{base_cdn}/#{userId}/#{sha}\n       https://#{user_cdn}/#{sha}\n\nS3 Bucket Config\n----------------\n\nYou need to set up CORS on the S3 Bucket to allow posting from the browser\n\n    <CORSConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01\">\n       <CORSRule>\n          <AllowedOrigin>*</AllowedOrigin>\n          <AllowedMethod>GET</AllowedMethod>\n          <AllowedMethod>PUT</AllowedMethod>\n          <AllowedMethod>POST</AllowedMethod>\n          <AllowedMethod>DELETE</AllowedMethod>\n          <AllowedHeader>*</AllowedHeader>\n       </CORSRule>\n    </CORSConfiguration>\n\nSet up public read policy on S3 Bucket\n\n    {\n    \t\"Version\": \"2012-10-17\",\n    \t\"Statement\": [\n    \t\t{\n    \t\t\t\"Effect\": \"Allow\",\n    \t\t\t\"Principal\": \"*\",\n    \t\t\t\"Action\": [\n    \t\t\t\t\"s3:GetObject\"\n    \t\t\t],\n    \t\t\t\"Resource\": [\n    \t\t\t\t\"arn:aws:s3:::whimsy-fs/*\"\n    \t\t\t]\n    \t\t}\n    \t]\n    }\n\nCloudfront Config\n-----------------\n\nhttps only\n\nPoint at S3 bucket\n\nEnable options and whitelist headers for CORS\n\n\nRoute53 Config\n--------------\n\nfs.whimsy.space\n\nCreate A (Alias record) pointing to cloudfront distribution\n\n\nAWS Policy Doc\n------------------\n\n    {\n        \"Version\": \"2012-10-17\",\n        \"Statement\": [\n            {\n                \"Effect\": \"Allow\",\n                \"Action\": [\n                    \"dynamodb:GetItem\",\n                    \"dynamodb:BatchGetItem\",\n                    \"dynamodb:Query\",\n                    \"dynamodb:PutItem\",\n                    \"dynamodb:UpdateItem\",\n                    \"dynamodb:DeleteItem\",\n                    \"dynamodb:BatchWriteItem\"\n                ],\n                \"Resource\": [\n                    \"arn:aws:dynamodb:us-east-1:186123361267:table/whimsy-fs\"\n                ],\n                \"Condition\": {\n                    \"ForAllValues:StringEquals\": {\n                        \"dynamodb:LeadingKeys\": [\n                            \"${cognito-identity.amazonaws.com:sub}\"\n                        ]\n                    }\n                }\n            },\n            {\n                \"Action\": [\n                    \"s3:ListBucket\"\n                ],\n                \"Effect\": \"Allow\",\n                \"Resource\": [\n                    \"arn:aws:s3:::whimsy-fs\"\n                ],\n                \"Condition\": {\n                    \"StringLike\": {\n                        \"s3:prefix\": [\n                            \"${cognito-identity.amazonaws.com:sub}/*\"\n                        ]\n                    }\n                }\n            },\n            {\n                \"Action\": [\n                    \"s3:GetObject\",\n                    \"s3:PutObject\"\n                ],\n                \"Effect\": \"Allow\",\n                \"Resource\": [\n                    \"arn:aws:s3:::whimsy-fs/${cognito-identity.amazonaws.com:sub}/*\"\n                ]\n            }\n        ]\n    }\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/sha.coffee": {
      "path": "lib/sha.coffee",
      "content": "urlSafeBase64 = (base64) ->\n  base64.replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/\\=*$/, '')\n\narrayBufferToBase64 = (buffer) ->\n  bytes = new Uint8Array(buffer)\n\n  binary = \"\"\n\n  bytes.forEach (byte) ->\n    binary += String.fromCharCode(byte)\n\n  return btoa(binary)\n\nshaForBlob = (blob) ->\n  new Promise (resolve, reject) ->\n    reader = new FileReader\n\n    reader.onload = ->\n      buffer = reader.result\n      crypto.subtle.digest(\"SHA-256\", buffer)\n      .then resolve\n      .catch reject\n\n    reader.onerror = reject\n\n    reader.readAsArrayBuffer(blob)\n\ndemo = ->\n  [\"yolo\", \"duder\", \"hello\", \"wat\"].forEach (test) ->\n    blob = new Blob [test]\n\n    shaForBlob(blob)\n    .then arrayBufferToBase64\n    .then urlSafeBase64\n    .then log\n\nmodule.exports = (blob) ->\n  shaForBlob(blob)\n  .then arrayBufferToBase64\n  .then urlSafeBase64\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "aws": {
      "path": "aws",
      "content": "(function() {\n  var SHA, log, pinvoke, queryDynamoDB, readFromDynamoDB, uploadFile, uploadToS3, writeToDynamoDB,\n    __slice = [].slice;\n\n  log = function() {\n    var obj, rest;\n    obj = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    console.log.apply(console, [obj].concat(__slice.call(rest)));\n    return obj;\n  };\n\n  pinvoke = function() {\n    var method, object, params;\n    object = arguments[0], method = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];\n    return new Promise(function(resolve, reject) {\n      return object[method].apply(object, __slice.call(params).concat([function(err, result) {\n        if (err) {\n          reject(err);\n          return;\n        }\n        return resolve(result);\n      }]));\n    });\n  };\n\n  SHA = require(\"./lib/sha\");\n\n  AWS.config.update({\n    region: 'us-east-1'\n  });\n\n  AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n    IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n  });\n\n  uploadToS3 = function(bucket, file, key) {\n    var params;\n    params = {\n      Key: key,\n      ContentType: file.type,\n      Body: file\n    };\n    return pinvoke(bucket, \"putObject\", params);\n  };\n\n  writeToDynamoDB = function(table, id, path, sha) {\n    var params, time;\n    time = \"\" + (+(new Date));\n    params = {\n      Item: {\n        owner: {\n          S: id\n        },\n        path: {\n          S: path\n        },\n        created_at: {\n          S: time\n        },\n        sha: {\n          S: sha\n        }\n      }\n    };\n    return pinvoke(table, \"putItem\", params);\n  };\n\n  queryDynamoDB = function(table, id) {\n    var params;\n    table = table;\n    params = {\n      AttributesToGet: [\"path\", \"sha\"],\n      KeyConditions: {\n        owner: {\n          ComparisonOperator: \"EQ\",\n          AttributeValueList: [\n            {\n              S: id\n            }\n          ]\n        }\n      }\n    };\n    return pinvoke(table, \"query\", params);\n  };\n\n  readFromDynamoDB = function(id, path) {\n    var params;\n    params = {\n      Key: {\n        owner: {\n          S: id\n        },\n        path: {\n          S: path\n        }\n      }\n    };\n    return pinvoke(table, \"getItem\", params);\n  };\n\n  uploadFile = function(table, bucket, id, file, path) {\n    return SHA(file).then(function(sha) {\n      var s3Key;\n      s3Key = \"\" + id + \"/\" + sha;\n      return Promise.all([uploadToS3(bucket, file, s3Key), writeToDynamoDB(table, id, path, sha)]);\n    });\n  };\n\n  (function() {\n    var bucket, file, table;\n    table = new AWS.DynamoDB({\n      params: {\n        TableName: 'whimsy-fs'\n      }\n    });\n    bucket = new AWS.S3({\n      params: {\n        Bucket: \"whimsy-fs\"\n      }\n    });\n    file = new File([\"yolo\"], \"filename.txt\", {\n      type: \"text/plain\"\n    });\n    return pinvoke(AWS.config.credentials, \"get\").then(function() {\n      var id;\n      id = AWS.config.credentials.identityId;\n      return uploadFile(table, bucket, id, file, \"/test/file.txt\")[\"catch\"](function(e) {\n        return console.error(e);\n      }).then(function() {\n        return queryDynamoDB(table, id);\n      }).then(log);\n    });\n  })();\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  require(\"./aws\");\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"remoteDependencies\":[\"https://sdk.amazonaws.com/js/aws-sdk-2.2.42.min.js\"]};",
      "type": "blob"
    },
    "lib/sha": {
      "path": "lib/sha",
      "content": "(function() {\n  var arrayBufferToBase64, demo, shaForBlob, urlSafeBase64;\n\n  urlSafeBase64 = function(base64) {\n    return base64.replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/\\=*$/, '');\n  };\n\n  arrayBufferToBase64 = function(buffer) {\n    var binary, bytes;\n    bytes = new Uint8Array(buffer);\n    binary = \"\";\n    bytes.forEach(function(byte) {\n      return binary += String.fromCharCode(byte);\n    });\n    return btoa(binary);\n  };\n\n  shaForBlob = function(blob) {\n    return new Promise(function(resolve, reject) {\n      var reader;\n      reader = new FileReader;\n      reader.onload = function() {\n        var buffer;\n        buffer = reader.result;\n        return crypto.subtle.digest(\"SHA-256\", buffer).then(resolve)[\"catch\"](reject);\n      };\n      reader.onerror = reject;\n      return reader.readAsArrayBuffer(blob);\n    });\n  };\n\n  demo = function() {\n    return [\"yolo\", \"duder\", \"hello\", \"wat\"].forEach(function(test) {\n      var blob;\n      blob = new Blob([test]);\n      return shaForBlob(blob).then(arrayBufferToBase64).then(urlSafeBase64).then(log);\n    });\n  };\n\n  module.exports = function(blob) {\n    return shaForBlob(blob).then(arrayBufferToBase64).then(urlSafeBase64);\n  };\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "entryPoint": "main",
  "remoteDependencies": [
    "https://sdk.amazonaws.com/js/aws-sdk-2.2.42.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/swag",
    "homepage": null,
    "description": "Serverless Working Applications Group",
    "html_url": "https://github.com/STRd6/swag",
    "url": "https://api.github.com/repos/STRd6/swag",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});