S3Driver = require "../fs/s3-driver"
Filesystem = require "../fs/filesystem"

{readAsText} = require "../util"
{awsLogin} = require "../amazon_login"

AWS.config.update
  region: 'us-east-1'

AWS.config.credentials = new AWS.CognitoIdentityCredentials
  IdentityPoolId: 'us-east-1:4fe22da5-bb5e-4a78-a260-74ae0a140bf9'

setup = ->
  options = { scope : 'profile' }
  awsLogin options
  .then (logins) ->
    id = AWS.config.credentials.identityId
    bucket = new AWS.S3
      params:
        Bucket: "whimsy-fs"

    fs = Filesystem S3Driver(id, bucket)
    fs.cd "test"

    fs

describe "S3 FS", ->
->
  it "should write, read, and delete files", (done) ->
    @timeout(10000)

    setup()
    .then (fs) ->
      blob = new Blob ["yolo"]

      fs.write "test", blob
      .then ->
        fs.read("test")
      .then ({blob}) ->
        readAsText blob
      .then (content) ->
        assert.equal content, "yolo"
      .then ->
        done()
    .catch done

  it "should list files in the directory", (done) ->
    @timeout(5000)

    setup()
    .then (fs) ->
      blob = new Blob ["yolo"]

      Promise.all [
        "test2"
        "yolo/yo"
        "yolo/yo2"
      ].map (path) ->
        fs.write path, blob
      .then ->
        fs.ls "yolo"
      .then (results) ->
        console.log "RES", results
        assert.equal results.length, 2
        done()
    .catch done
