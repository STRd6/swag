DexieDriver = require "../fs/dexie-driver"
Filesystem = require "../fs/filesystem"

{readAsText} = require "../util"

describe "Dexie FS", ->
  fs = Filesystem DexieDriver('test-fs')

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
