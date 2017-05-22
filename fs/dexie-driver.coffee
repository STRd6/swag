{uniq} = require "../util"

module.exports = (db) ->
  Files = db.files

  read: (path) ->
    Files.get(path)

  write: (path, blob) ->
    now = +new Date

    Files.put
      path: path
      blob: blob
      size: blob.size
      type: blob.type
      createdAt: now
      updatedAt: now

  delete: (path) ->
    Files.delete(path)

  list: (dir) ->
    Files.where("path").startsWith(dir).toArray()
    .then (results) ->
      uniq results.map ({path}) ->
        path = path.replace(dir, "").replace(/\/.*$/, "/")
