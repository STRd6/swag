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
      "content": "remoteDependencies: [\n  \"https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js\"\n]\n",
      "mode": "100644"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "\\*S\\*W\\*A\\*G\\*\n\nLet's use AWS Cognitor to be all serverless all the time!\n\n    AWS.config.update({region: 'us-east-1'})\n\n    AWS.config.credentials = new AWS.CognitoIdentityCredentials\n      IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n\n    console.log \"duder\"\n\n    AWS.config.credentials.get ->\n      # This doesn't seem to exist in the browser :|\n      # syncClient = new AWS.CognitoSyncManager()\n\n    # YoloDB\n    db = new AWS.DynamoDB()\n    db.listTables (err, data) ->\n      console.log(data.TableNames)\n\n    table = new AWS.DynamoDB\n      params: \n        TableName: 'swag'\n\n    key = 'UNIQUE_KEY_ID'\n    time = \"#{+new Date}\"\n\n    # Write the item to the table\n    itemParams = \n      Item:\n        id: {S: key}\n        created_at: {S: time}\n        data: {S: 'data'}\n\n    table.putItem itemParams, ->\n      # Read the item from the table\n      table.getItem {Key: {id: {S: key}}}, (err, data) ->\n        if err\n          console.log err\n        else\n          console.log data\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"remoteDependencies\":[\"https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js\"]};",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var db, itemParams, key, table, time;\n\n  AWS.config.update({\n    region: 'us-east-1'\n  });\n\n  AWS.config.credentials = new AWS.CognitoIdentityCredentials({\n    IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'\n  });\n\n  console.log(\"duder\");\n\n  AWS.config.credentials.get(function() {});\n\n  db = new AWS.DynamoDB();\n\n  db.listTables(function(err, data) {\n    return console.log(data.TableNames);\n  });\n\n  table = new AWS.DynamoDB({\n    params: {\n      TableName: 'swag'\n    }\n  });\n\n  key = 'UNIQUE_KEY_ID';\n\n  time = \"\" + (+(new Date));\n\n  itemParams = {\n    Item: {\n      id: {\n        S: key\n      },\n      created_at: {\n        S: time\n      },\n      data: {\n        S: 'data'\n      }\n    }\n  };\n\n  table.putItem(itemParams, function() {\n    return table.getItem({\n      Key: {\n        id: {\n          S: key\n        }\n      }\n    }, function(err, data) {\n      if (err) {\n        return console.log(err);\n      } else {\n        return console.log(data);\n      }\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "entryPoint": "main",
  "remoteDependencies": [
    "https://sdk.amazonaws.com/js/aws-sdk-2.1.22.js"
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