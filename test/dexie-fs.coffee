DexieDriver = require "../fs/dexie-driver"
Filesystem = require "../fs/filesystem"
DB = require "../db"

{readAsText} = require "../util"

describe "Dexie FS", ->
  db = DB('fs-test')
  fs = Filesystem DexieDriver(db)

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
      "yolo/yo2"
    ].map (path) ->
      fs.write path, blob
    .then ->
      fs.ls "yolo"
    .then (results) ->
      assert.equal results.length, 2
      done()
    .catch done
