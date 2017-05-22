

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

Filesystem = require "./fs/filesystem"
S3Driver = require "./fs/s3-driver"
LocalDriver = require "./fs/dexie-driver"
OS = require "./os"
os = OS()

global.os = os

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

AWS.config.update
  region: 'us-east-1'

if false # S3
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

  {awsLogin} = require "./amazon_login"
  loginTemplate = require("./templates/login")
    click: ->
      options = { scope : 'profile' }
      awsLogin(options)
      .then (logins) ->
        localStorage.WHIMSY_FS_AWS_LOGIN = JSON.stringify(logins)
        receivedCredentials()

  document.body.appendChild loginTemplate

  receivedCredentials = ->
    console.log AWS.config.credentials
    id = AWS.config.credentials.identityId

    document.body.removeChild loginTemplate

    bucket = new AWS.S3
      params:
        Bucket: "whimsy-fs"

    os.attachFS Filesystem S3Driver(id, bucket)

else
  db = require("./db")('fs')
  os.attachFS Filesystem LocalDriver(db)

  global.db = db
