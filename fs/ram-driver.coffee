{startsWith, uniq} = require "../util"

module.exports = (files=[]) ->
  P = (fn) ->
    Promise.resolve().then fn

  self =
    read: (path) ->
      P ->
        [file] = files.filter ({path:filePath}) ->
          path is filePath

        return file

    write: (path, blob) ->
      self.read path
      .then (file) ->
        now = +new Date

        if file
          file.blob = blob
          file.type = blob.type
          file.updatedAt = now
        else
          files.push
            path: path
            blob: blob
            type: blob.type
            updatedAt: now
            createdAt: now

    delete: (path) ->
      P ->
        files = files.filter ({path:filePath}) ->
          path != filePath

        return

    list: (dir) ->
      P ->
        files.filter ({path}) ->
          startsWith path, dir

      .then (results) ->
        uniq results.map ({path}) ->
          path = path.replace(dir, "").replace(/\/.*$/, "/")
