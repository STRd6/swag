
# Add logins when creating Cognito credentials
# http://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html
# http://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html#updating-the-logins-map
# Once you obtain an identity ID and session token from your backend, you will
# to pass them into the AWS.CognitoIdentityCredentials provider. Here's an example:
#AWS.config.credentials = new AWS.CognitoIdentityCredentials({
   #IdentityPoolId: 'IDENTITY_POOL_ID',
   #IdentityId: 'IDENTITY_ID_RETURNED_FROM_YOUR_PROVIDER',
   #Logins: {
      #'cognito-identity.amazonaws.com': 'TOKEN_RETURNED_FROM_YOUR_PROVIDER'
   #}
#});

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

SHA = require "./lib/sha"

AWS.config.update({region: 'us-east-1'})

AWS.config.credentials = new AWS.CognitoIdentityCredentials
  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'

uploadToS3 = (bucket, file, key) ->
  params =
    Key: key
    ContentType: file.type
    Body: file
    # ACL: 'public-read'

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

readFromDynamoDB = (id, path) ->
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

    Promise.all [
      uploadToS3(bucket, file, s3Key)
      writeToDynamoDB(table, id, path, sha)
    ]

->
  table = new AWS.DynamoDB
    params:
      TableName: 'whimsy-fs'

  bucket = new AWS.S3
    params:
      Bucket: "whimsy-fs"

  file = new File ["yolo"], "filename.txt", {type: "text/plain"}

  pinvoke AWS.config.credentials, "get"
  .then ->
    id = AWS.config.credentials.identityId

    uploadFile(table, bucket, id, file, "/test/file.txt")
    .catch (e) ->
      console.error e
    .then ->
      queryDynamoDB(table, id)
    .then log
