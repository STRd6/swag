
AWS.config.update({region: 'us-east-1'})

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

log = console.log.bind(console)

AWS.config.credentials = new AWS.CognitoIdentityCredentials
  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'

dynamoDBTest = (err) ->
  throw err if err
  id = AWS.config.credentials.identityId
  log id

  table = new AWS.DynamoDB
    params:
      TableName: 'swag'

  key = id
  time = "#{+new Date}"

  # Write the item to the table
  itemParams =
    Item:
      id: {S: key}
      created_at: {S: time}
      data: {S: 'data'}

  table.putItem itemParams, (err) ->
    if err
      console.log err
      return

    # Read the item from the table
    table.getItem {Key: {id: {S: key}}}, (err, data) ->
      if err
        console.log err
      else
        console.log data

# dynamoDBTest()
AWS.config.credentials.get(dynamoDBTest)
