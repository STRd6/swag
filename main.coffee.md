\*S\*W\*A\*G\*

Let's use AWS Cognito to be all serverless all the time!

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

    style = document.createElement "style"
    style.innerHTML = require "./style"
    document.head.appendChild style

    {log} = require "./util"

    AWS.config.update
      region: 'us-east-1'

    AWS.config.credentials = new AWS.CognitoIdentityCredentials
      IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'

    table = new AWS.DynamoDB
      params:
        TableName: 'whimsy-fs'

    bucket = new AWS.S3
      params:
        Bucket: "whimsy-fs"

    require "./amazon_login"
    document.body.appendChild require("./templates/login")()

    queryUserInfo = (token) ->
      fetch "https://api.amazon.com/user/profile",
        headers:
          Authorization: "bearer #{token}"
          Accept: "application/json"
      .then (response) ->
        response.json()
      .then (json) ->
        console.log json
      .catch (e) ->
        console.error e

    document.getElementById('LoginWithAmazon').onclick = ->
      options = { scope : 'profile' }
      amazon.Login.authorize options, (resp) ->
        if !resp.error
          token = resp.access_token
          creds = AWS.config.credentials

          creds.params.Logins =
            'www.amazon.com': token

          creds.expired = true

          queryUserInfo(token)

          AWS.config.credentials.get (err) ->
            return console.error err if err

            id = AWS.config.credentials.identityId

            fs = require('./fs')(id, bucket)

            file = new File ['yolo'], "file.txt", type: "text/plain"
            # fs.put "Desktop/stuff/cool/wat.txt", file
            ->
              ["Desktop/cool.txt", "Desktop/rad.txt", "Desktop/yolo.txt", "Desktop/duder.txt"].forEach (path) ->
                fs.put path, file

            FolderTemplate = require "./templates/folder"
            FolderPresenter = require "./presenters/folder"

            os =
              open: (path) ->
                fs.get(path)
                .then (result) ->
                  console.log result

            document.body.appendChild FolderTemplate FolderPresenter {path: "/"}, fs, os

      return false