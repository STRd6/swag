# FS

DexieFS = require "../fs/dexie-driver"
Filesystem = require "../fs/filesystem"

fs = Filesystem DexieFS('fs')

fs.cd "goose"
fs.cd "rad"

fs.cd "/grass"

fs.ls "/"
.then (results) ->
  console.log results

fs.write "test", new Blob ['duder']
.then ->
  fs.read("test")
  .then (file) ->
    console.log file
  .catch (e) ->
    console.error e

# TODO

# Mount filesystems at directories
#
# /local
# /s3
# ...
