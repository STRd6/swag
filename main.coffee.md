\*S\*W\*A\*G\*

Let's use AWS Cognitor to be all serverless all the time!

    AWS.config.update({region: 'us-east-1'})

    AWS.config.credentials = new AWS.CognitoIdentityCredentials
      IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'

    console.log "duder"

    AWS.config.credentials.get ->
      # This doesn't seem to exist in the browser :|
      # syncClient = new AWS.CognitoSyncManager()

    # YoloDB
    db = new AWS.DynamoDB()
    db.listTables (err, data) ->
      console.log(data.TableNames)

    table = new AWS.DynamoDB
      params: 
        TableName: 'swag'

    key = 'UNIQUE_KEY_ID'
    time = "#{+new Date}"

    # Write the item to the table
    itemParams = 
      Item:
        id: {S: key}
        created_at: {S: time}
        data: {S: 'data'}

    table.putItem itemParams, ->
      # Read the item from the table
      table.getItem {Key: {id: {S: key}}}, (err, data) ->
        if err
          console.log err
        else
          console.log data
