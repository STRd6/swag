

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

style = document.createElement "style"
style.innerHTML = require "./style"
document.head.appendChild style

{log, emptyElement, pinvoke} = require "./util"

Drop = require("./lib/drop")

OS = require "./os"
os = OS()

OSTemplate = require "./templates/os"
document.body.appendChild OSTemplate os

initFileDrop = (element, processItem) ->
  Drop element, (e) ->

    handleFiles = (items, path="/") ->
      items.forEach (item) ->
        if item.getFilesAndDirectories
          item.getFilesAndDirectories().then (items) ->
            handleFiles(items, item.path)
        else
          processItem item, path
    e.dataTransfer.getFilesAndDirectories().then (items) ->
      handleFiles(items)

initFileDrop document, (file, path) ->
  # TODO: Why is this getting double slashes on single files?
  key = "#{path}/#{file.name}".replace(/\/+/, "/")
  os.put key, file

receivedCredentials = ->
  console.log AWS.config.credentials
  id = AWS.config.credentials.identityId

  document.body.removeChild document.querySelector('#LoginWithAmazon')

  bucket = new AWS.S3
    params:
      Bucket: "whimsy-fs"

  fs = require('./fs')(id, bucket)

  os.attachFS fs

AWS.config.update
  region: 'us-east-1'

try
  logins = JSON.parse localStorage.WHIMSY_FS_AWS_LOGIN

AWS.config.credentials = new AWS.CognitoIdentityCredentials
  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'
  Logins: logins

if logins
  pinvoke AWS.config.credentials, "get"
  .then receivedCredentials
  .catch (e) ->
    console.error e

require "./amazon_login"
document.body.appendChild require("./templates/login")
  click: ->
    options = { scope : 'profile' }
    amazon.Login.authorize options, (resp) ->
      if !resp.error
        console.log resp
        token = resp.access_token
        creds = AWS.config.credentials

        logins =
          'www.amazon.com': token
        localStorage.WHIMSY_FS_AWS_LOGIN = JSON.stringify(logins)

        creds.params.Logins = logins

        creds.expired = true

        queryUserInfo(token)

        pinvoke AWS.config.credentials, "get"
        .then receivedCredentials

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

