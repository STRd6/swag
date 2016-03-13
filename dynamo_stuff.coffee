{pinvoke} = require "./util"

writeToDynamoDB = (table, id, path, sha) ->
  time = "#{+new Date}"

  # Write the item to the table
  params =
    Item:
      owner: {S: id}
      path: {S: path}
      created_at: {S: time}
      sha: {S: sha}

  pinvoke table, "putItem", params

queryDynamoDB = (table, id) ->
  # TODO: Start from
  # TODO: Additional requests when results are incomplete
  table = table

  params =
    AttributesToGet: [
      "path"
      "sha"
    ]
    KeyConditions:
      owner:
        ComparisonOperator: "EQ"
        AttributeValueList: [S: id]

  pinvoke table, "query", params

readFromDynamoDB = (table, id, path) ->
  params = 
    Key:
      owner: {S: id}
      path: {S: path}

  # Read the item from the table
  pinvoke table, "getItem", params
