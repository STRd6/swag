module.exports = (dbName='fs') ->
  db = new Dexie dbName

  db.version(1).stores
  	files: 'path, blob, type, createdAt, updatedAt'

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
      # TODO: Directory results?

      # Filter out everything that isn't a file in the current directory
      results.filter (result) ->
        result.path.replace(dir, "").indexOf('/') is -1
      .map ({path}) ->
        path.replace(dir, "")
