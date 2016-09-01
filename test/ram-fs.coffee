RAMDriver = require "../fs/ram-driver"
Filesystem = require "../fs/filesystem"

{readAsText} = require "../util"

describe "RAM FS", ->
  fs = Filesystem RAMDriver()

  it "should write, read, and delete files", (done) ->
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
    blob = new Blob ["yolo"]

    Promise.all [
      "test2"
      "yolo/yo"
      "yolo/yo2/wat"
      "yolo/yo2/cool"
    ].map (path) ->
      fs.write path, blob
    .then ->
      fs.ls "yolo"
    .then (results) ->
      assert.equal results.length, 2
      assert.equal results[0], "yo"
      assert.equal results[1], "yo2/"
      done()
    .catch done
