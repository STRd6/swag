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
      "content": "\nAWS.config.update({region: 'us-east-1'})\n\n# Add logins when creating Cognito credentials\n# http://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html\n# http://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html#updating-the-logins-map\n# Once you obtain an identity ID and session token from your backend, you will\n# to pass them into the AWS.CognitoIdentityCredentials provider. Here's an example:\n#AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n   #IdentityPoolId: 'IDENTITY_POOL_ID',\n   #IdentityId: 'IDENTITY_ID_RETURNED_FROM_YOUR_PROVIDER',\n   #Logins: {\n      #'cognito-identity.amazonaws.com': 'TOKEN_RETURNED_FROM_YOUR_PROVIDER'\n   #}\n#});\n\nlog = console.log.bind(console)\nSHA = require \"./lib/sha\"\n\nAWS.config.credentials = new AWS.CognitoIdentityCredentials\n  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n\ns3Test = (err) ->\n  throw err if err\n\n  id = AWS.config.credentials.identityId\n\n  file = new File [\"yolo\"], \"filename.txt\", {type: \"text/plain\"}\n\n  log file\n\n  SHA file\n  .then (sha) ->\n    key = \"#{id}/#{sha}\"\n\n    bucket = new AWS.S3\n      params:\n        Bucket: \"whimsy-fs\"\n\n    params =\n      Key: key\n      ContentType: file.type\n      Body: file\n      # ACL: 'public-read'\n  \n    bucket.putObject params, (err, data) ->\n      throw err if err\n  \n      log data\n\ndynamoDBTest = (err) ->\n  throw err if err\n  log AWS.config.credentials\n\n  id = AWS.config.credentials.identityId\n\n  table = new AWS.DynamoDB\n    params:\n      TableName: 'whimsy-fs'\n\n  path = \"/test2\"\n  time = \"#{+new Date}\"\n\n  # Write the item to the table\n  itemParams =\n    Item:\n      owner: {S: id}\n      path: {S: path}\n      created_at: {S: time}\n      sha: {S: \"test\"}\n\n  table.putItem itemParams, (err) ->\n    if err\n      console.log err\n      return\n\n    # Read the item from the table\n    table.getItem {Key: {\n      owner: {S: id},\n      path: {S: path}\n    }}, (err, data) ->\n      if err\n        console.log err\n      else\n        console.log data\n\n# AWS.config.credentials.get(dynamoDBTest)\n# AWS.config.credentials.get(s3Test)",
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
      "content": "Whimsy FS\n=========\n\nDynamoDB Semantic Records linking to S3 Content Addressable Store\n\nDynamoDB Table\n\n      Primary keys     Index    Link to CAS\n        |       |        |           |\n    +-------+------+-----------+----------+------------------------\n    | owner | path | createdAt |    sha   |  extra... (tags, etc.)\n\n\nSaving a File\n-------------\n\nsha is base64 url-encoded sha256 of file contents\n\nCompute sha, save to S3 and DynamoDB\n\nS3 path is \"${cognito-identity.amazonaws.com:sub}/#{sha}\"\n\nDynamoDB path is logical path ex: /Desktop/yolo.png\nowner is \"${cognito-identity.amazonaws.com:sub}\"\ncreatedAt number: unix epoch timestamp\nsha is the same sha that matches s3\narbitrary extra meta data can be added\n\nurls can be constructed by\n\n       https://s3.amazonaws.com/#{bucket}/#{userId}/#{sha}\n    -> https://#{base_cdn}/#{userId}/#{sha}\n       https://#{user_cdn}/#{sha}\n\nS3 Bucket Config\n----------------\n\nYou need to set up CORS on the S3 Bucket to allow posting from the browser\n\n    <CORSConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01\">\n       <CORSRule>\n          <AllowedOrigin>*</AllowedOrigin>\n          <AllowedMethod>GET</AllowedMethod>\n          <AllowedMethod>PUT</AllowedMethod>\n          <AllowedMethod>POST</AllowedMethod>\n          <AllowedMethod>DELETE</AllowedMethod>\n          <AllowedHeader>*</AllowedHeader>\n       </CORSRule>\n    </CORSConfiguration>\n\nSet up public read policy on S3 Bucket\n\n    {\n    \t\"Version\": \"2012-10-17\",\n    \t\"Statement\": [\n    \t\t{\n    \t\t\t\"Effect\": \"Allow\",\n    \t\t\t\"Principal\": \"*\",\n    \t\t\t\"Action\": [\n    \t\t\t\t\"s3:GetObject\"\n    \t\t\t],\n    \t\t\t\"Resource\": [\n    \t\t\t\t\"arn:aws:s3:::whimsy-fs/*\"\n    \t\t\t]\n    \t\t}\n    \t]\n    }\n\nCloudfront Config\n-----------------\n\nTODO\n\nRoute53 Config\n--------------\n\nTODO\n\n\nAWS Policy Doc\n------------------\n\n    {\n        \"Version\": \"2012-10-17\",\n        \"Statement\": [\n            {\n                \"Effect\": \"Allow\",\n                \"Action\": [\n                    \"dynamodb:GetItem\",\n                    \"dynamodb:BatchGetItem\",\n                    \"dynamodb:Query\",\n                    \"dynamodb:PutItem\",\n                    \"dynamodb:UpdateItem\",\n                    \"dynamodb:DeleteItem\",\n                    \"dynamodb:BatchWriteItem\"\n                ],\n                \"Resource\": [\n                    \"arn:aws:dynamodb:us-east-1:186123361267:table/whimsy-fs\"\n                ],\n                \"Condition\": {\n                    \"ForAllValues:StringEquals\": {\n                        \"dynamodb:LeadingKeys\": [\n                            \"${cognito-identity.amazonaws.com:sub}\"\n                        ]\n                    }\n                }\n            },\n            {\n                \"Action\": [\n                    \"s3:ListBucket\"\n                ],\n                \"Effect\": \"Allow\",\n                \"Resource\": [\n                    \"arn:aws:s3:::whimsy-fs\"\n                ],\n                \"Condition\": {\n                    \"StringLike\": {\n                        \"s3:prefix\": [\n                            \"${cognito-identity.amazonaws.com:sub}/*\"\n                        ]\n                    }\n                }\n            },\n            {\n                \"Action\": [\n                    \"s3:GetObject\",\n                    \"s3:PutObject\"\n                ],\n                \"Effect\": \"Allow\",\n                \"Resource\": [\n                    \"arn:aws:s3:::whimsy-fs/${cognito-identity.amazonaws.com:sub}/*\"\n                ]\n            }\n        ]\n    }\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/sha.coffee": {
      "path": "lib/sha.coffee",
      "content": "urlSafeBase64 = (base64) ->\n  base64.replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/\\=*$/, '')\n\narrayBufferToBase64 = (buffer) ->\n  bytes = new Uint8Array(buffer)\n\n  binary = \"\"\n\n  bytes.forEach (byte) ->\n    binary += String.fromCharCode(byte)\n\n  return btoa(binary)\n\nshaForBlob = (blob) ->\n  new Promise (resolve, reject) ->\n    reader = new FileReader\n\n    reader.onload = ->\n      buffer = reader.result\n      crypto.subtle.digest(\"SHA-256\", buffer)\n      .then resolve\n      .catch reject\n\n    reader.onerror = reject\n\n    reader.readAsArrayBuffer(blob)\n\ndemo = ->\n  [\"yolo\", \"duder\", \"hello\", \"wat\"].forEach (test) ->\n    blob = new Blob [test]\n\n    shaForBlob(blob)\n    .then arrayBufferToBase64\n    .then urlSafeBase64\n    .then log\n\nmodule.exports = (blob) ->\n  shaForBlob(blob)\n  .then arrayBufferToBase64\n  .then urlSafeBase64\nc",
      "mode": "100644"
    }
  },
  "distribution": {
    "aws": {
      "path": "aws",
      "content": "(function() {\n  var SHA, dynamoDBTest, log, s3Test;\n\n  AWS.config.update({\n    region: 'us-east-1'\n  });\n\n  log = console.log.bind(console);\n\n  SHA = require(\"./lib/sha\");\n\n  AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n    IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n  });\n\n  s3Test = function(err) {\n    var file, id;\n    if (err) {\n      throw err;\n    }\n    id = AWS.config.credentials.identityId;\n    file = new File([\"yolo\"], \"filename.txt\", {\n      type: \"text/plain\"\n    });\n    log(file);\n    return SHA(file).then(function(sha) {\n      var bucket, key, params;\n      key = \"\" + id + \"/\" + sha;\n      bucket = new AWS.S3({\n        params: {\n          Bucket: \"whimsy-fs\"\n        }\n      });\n      params = {\n        Key: key,\n        ContentType: file.type,\n        Body: file\n      };\n      return bucket.putObject(params, function(err, data) {\n        if (err) {\n          throw err;\n        }\n        return log(data);\n      });\n    });\n  };\n\n  dynamoDBTest = function(err) {\n    var id, itemParams, path, table, time;\n    if (err) {\n      throw err;\n    }\n    log(AWS.config.credentials);\n    id = AWS.config.credentials.identityId;\n    table = new AWS.DynamoDB({\n      params: {\n        TableName: 'whimsy-fs'\n      }\n    });\n    path = \"/test2\";\n    time = \"\" + (+(new Date));\n    itemParams = {\n      Item: {\n        owner: {\n          S: id\n        },\n        path: {\n          S: path\n        },\n        created_at: {\n          S: time\n        },\n        sha: {\n          S: \"test\"\n        }\n      }\n    };\n    return table.putItem(itemParams, function(err) {\n      if (err) {\n        console.log(err);\n        return;\n      }\n      return table.getItem({\n        Key: {\n          owner: {\n            S: id\n          },\n          path: {\n            S: path\n          }\n        }\n      }, function(err, data) {\n        if (err) {\n          return console.log(err);\n        } else {\n          return console.log(data);\n        }\n      });\n    });\n  };\n\n}).call(this);\n",
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
      "content": "(function() {\n  var arrayBufferToBase64, demo, shaForBlob, urlSafeBase64;\n\n  urlSafeBase64 = function(base64) {\n    return base64.replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/\\=*$/, '');\n  };\n\n  arrayBufferToBase64 = function(buffer) {\n    var binary, bytes;\n    bytes = new Uint8Array(buffer);\n    binary = \"\";\n    bytes.forEach(function(byte) {\n      return binary += String.fromCharCode(byte);\n    });\n    return btoa(binary);\n  };\n\n  shaForBlob = function(blob) {\n    return new Promise(function(resolve, reject) {\n      var reader;\n      reader = new FileReader;\n      reader.onload = function() {\n        var buffer;\n        buffer = reader.result;\n        return crypto.subtle.digest(\"SHA-256\", buffer).then(resolve)[\"catch\"](reject);\n      };\n      reader.onerror = reject;\n      return reader.readAsArrayBuffer(blob);\n    });\n  };\n\n  demo = function() {\n    return [\"yolo\", \"duder\", \"hello\", \"wat\"].forEach(function(test) {\n      var blob;\n      blob = new Blob([test]);\n      return shaForBlob(blob).then(arrayBufferToBase64).then(urlSafeBase64).then(log);\n    });\n  };\n\n  module.exports = function(blob) {\n    return shaForBlob(blob).then(arrayBufferToBase64).then(urlSafeBase64);\n  };\n\n  c;\n\n}).call(this);\n",
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