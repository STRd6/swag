window["STRd6/swag:master"]({
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
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "remoteDependencies: [\n  \"https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js\"\n  \"http://cdn.pubnub.com/pubnub-3.7.1.js\"\n]\n",
      "mode": "100644"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "\\*S\\*W\\*A\\*G\\*\n\nLet's use AWS Cognitor to be all serverless all the time!\n\n    # require \"./aws\"\n    require \"./pubnub\"\n",
      "mode": "100644"
    },
    "aws.coffee": {
      "path": "aws.coffee",
      "content": "AWS.config.update({region: 'us-east-1'})\n\nAWS.config.credentials = new AWS.CognitoIdentityCredentials\n  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n\nAWS.config.credentials.get ->\n  # This doesn't seem to exist in the browser :|\n  # syncClient = new AWS.CognitoSyncManager()\n\n# YoloDB\ndb = new AWS.DynamoDB()\ndb.listTables (err, data) ->\n  console.log(data.TableNames)\n\ntable = new AWS.DynamoDB\n  params: \n    TableName: 'swag'\n\nkey = 'UNIQUE_KEY_ID'\ntime = \"#{+new Date}\"\n\n# Write the item to the table\nitemParams = \n  Item:\n    id: {S: key}\n    created_at: {S: time}\n    data: {S: 'data'}\n\ntable.putItem itemParams, ->\n  # Read the item from the table\n  table.getItem {Key: {id: {S: key}}}, (err, data) ->\n    if err\n      console.log err\n    else\n      console.log data\n",
      "mode": "100644"
    },
    "pubnub.coffee": {
      "path": "pubnub.coffee",
      "content": "global.pubnub = PUBNUB.init\n  publish_key: 'pub-c-010c4d6a-9e0f-43cc-87d3-d8e5ac1fb605'\n  subscribe_key: 'sub-c-df841964-de59-11e4-a1d1-0619f8945a4f'\n\npub = ->\n  console.log \"yolo\"\n  pubnub.publish\n    channel: 'demo_tutorial'\n    message:\n      color: \"blue\"\n\npubnub.subscribe\n  channel: 'demo_tutorial'\n  message: ->\n    console.log \"Message\", arguments\n  connect: ->\n    console.log \"Connect\", arguments\n  disconnect: ->\n    console.log \"Disconnect\", arguments\n  error: ->\n    console.error \"Error\", arguments\n\nconsole.log \"wat?\"\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"remoteDependencies\":[\"https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js\",\"http://cdn.pubnub.com/pubnub-3.7.1.js\"]};",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  require(\"./pubnub\");\n\n}).call(this);\n",
      "type": "blob"
    },
    "aws": {
      "path": "aws",
      "content": "(function() {\n  var db, itemParams, key, table, time;\n\n  AWS.config.update({\n    region: 'us-east-1'\n  });\n\n  AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n    IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n  });\n\n  AWS.config.credentials.get(function() {});\n\n  db = new AWS.DynamoDB();\n\n  db.listTables(function(err, data) {\n    return console.log(data.TableNames);\n  });\n\n  table = new AWS.DynamoDB({\n    params: {\n      TableName: 'swag'\n    }\n  });\n\n  key = 'UNIQUE_KEY_ID';\n\n  time = \"\" + (+(new Date));\n\n  itemParams = {\n    Item: {\n      id: {\n        S: key\n      },\n      created_at: {\n        S: time\n      },\n      data: {\n        S: 'data'\n      }\n    }\n  };\n\n  table.putItem(itemParams, function() {\n    return table.getItem({\n      Key: {\n        id: {\n          S: key\n        }\n      }\n    }, function(err, data) {\n      if (err) {\n        return console.log(err);\n      } else {\n        return console.log(data);\n      }\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pubnub": {
      "path": "pubnub",
      "content": "(function() {\n  var pub;\n\n  global.pubnub = PUBNUB.init({\n    publish_key: 'pub-c-010c4d6a-9e0f-43cc-87d3-d8e5ac1fb605',\n    subscribe_key: 'sub-c-df841964-de59-11e4-a1d1-0619f8945a4f'\n  });\n\n  pub = function() {\n    console.log(\"yolo\");\n    return pubnub.publish({\n      channel: 'demo_tutorial',\n      message: {\n        color: \"blue\"\n      }\n    });\n  };\n\n  pubnub.subscribe({\n    channel: 'demo_tutorial',\n    message: function() {\n      return console.log(\"Message\", arguments);\n    },\n    connect: function() {\n      return console.log(\"Connect\", arguments);\n    },\n    disconnect: function() {\n      return console.log(\"Disconnect\", arguments);\n    },\n    error: function() {\n      return console.error(\"Error\", arguments);\n    }\n  });\n\n  console.log(\"wat?\");\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "entryPoint": "main",
  "remoteDependencies": [
    "https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js",
    "http://cdn.pubnub.com/pubnub-3.7.1.js"
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