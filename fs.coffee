SHA = require "./lib/sha"

log = (obj, rest...) ->
  console.log obj, rest...
  return obj

pinvoke = (object, method, params...) ->
  new Promise (resolve, reject) ->
    object[method] params..., (err, result) ->
      if err
        reject err 
        return

      resolve result

uploadToS3 = (bucket, file, key) ->
  params =
    Key: key
    ContentType: file.type
    Body: file

  pinvoke bucket, "putObject", params

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

uploadFile = (table, bucket, id, file, path) ->
  SHA file
  .then (sha) ->
    s3Key = "#{id}/#{sha}"

    Promise.all([
      uploadToS3(bucket, file, s3Key)
      writeToDynamoDB(table, id, path, sha)
    ])
    .then ->
      path: path
      sha: sha

module.exports = (id, table, bucket) ->
  get: (path) ->
    readFromDynamoDB table, id, path
    .then (data) ->
      log data
  put: (path, file) ->
    uploadFile table, bucket, id, file, path
  query: ->
    queryDynamoDB table, id
