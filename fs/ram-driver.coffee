# A RAM backed filesystem
# Files are objects with a path, blob, type, updatedAt and createdAt properties

module.exports = (files=[]) ->
  notFound = "File not found"

  self =
    # Returns a promise that is fulfilled with the file if found or rejected 
    # with an error if no file is found at that path
    read: (path) ->
      P ->
        [file] = files.filter ({path:filePath}) ->
          path is filePath

        if file
          return file
        else
          throw notFound

    # Write a blob to the file system at the given path
    write: (path, blob) ->
      self.read path
      .catch (error) ->
        if error is notFound
          return
        else
          throw error
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

    # Delete the file at the given path
    delete: (path) ->
      P ->
        files = files.filter ({path:filePath}) ->
          path != filePath

        return

    # List the files and folders within a path
    # returns a promise that is fulfilled with an array of strings
    # files are strings that don't end in '/'
    # folders are strings that end in '/'
    list: (dir) ->
      P ->
        files.filter ({path}) ->
          startsWith path, dir

      .then (results) ->
        uniq results.map ({path}) ->
          path = path.replace(dir, "").replace(/\/.*$/, "/")

# Helper that lifts a function to a Promise chain
P = (fn) ->
  Promise.resolve().then fn

{startsWith, uniq} = require "../util"
