{uniq} = require "../util"

module.exports = (db) ->
  Files = db.files

  read: (path) ->
    Files.get(path)

  write: (path, blob) ->
    Files.put
      path: path
      blob: blob
      type: blob.type
      updatedAt: +new Date

  delete: (path) ->
    Files.delete(path)

  list: (dir) ->
    Files.where("path").startsWith(dir).toArray()
    .then (results) ->
      uniq results.map ({path}) ->
        path = path.replace(dir, "").replace(/\/.*$/, "/")
