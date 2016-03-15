

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

require "./lib/directory_upload"

Observable = require "observable"

style = document.createElement "style"
style.innerHTML = require "./style"
document.head.appendChild style

{log} = require "./util"

Drop = require("./lib/drop")
Drop document, (e) ->
  processItem = (item, path) ->
    console.log item, path

  handleFiles = (items, path="/") ->
    items.forEach (item) ->
      if item.getFilesAndDirectories
        item.getFilesAndDirectories().then (items) ->
          handleFiles(items, item.path)
      else
        processItem item, path
  e.dataTransfer.getFilesAndDirectories().then (items) ->
    handleFiles(items)

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

        EditorTemplate = require "./templates/editor"
        FolderTemplate = require "./templates/folder"
        FolderPresenter = require "./presenters/folder"

        os =
          open: (path) ->
            fs.get(path)
            .then (result) ->
              reader = new FileReader

              reader.onload = ->
                editor.contents reader.result
                editor.contentType result.type
                editor.path path

              reader.onerror = (e) ->
                console.error e

              reader.readAsText(result)

        editor =
          contents: Observable "Hello"
          contentType: Observable "text/plain"
          path: Observable "test.txt"
          save: ->
            blob = new Blob [editor.contents()], type: editor.contentType()
            fs.put editor.path(), blob

        document.body.appendChild FolderTemplate FolderPresenter {path: "/"}, fs, os
        document.body.appendChild EditorTemplate editor

  return false
