# FS


db = new Dexie 'fs'

db.version(1).stores
	files: 'path, blob, type, createdAt, updatedAt'

Files = db.files

fs = do ->
  SEPARATOR = "/"

  normalizeDir = (dir) ->
    normalizePath(dir).replace(/\/?$/, SEPARATOR)

  normalizePath = (path) ->
    path.replace(/\/\/+/, SEPARATOR)
    .replace(/\/[^/]*\/\.\./g, "") # handle .. paths
    .replace(/\/\.\//g, SEPARATOR) # handle . paths

  join = (paths...) ->
    normalizePath paths.join SEPARATOR

  pwd = SEPARATOR

  read: (path) ->
    Files.get(join(pwd, path))

  write: (path, blob) ->
    Files.put
      path: join(pwd, path)
      blob: blob
      type: blob.type
      updatedAt: +new Date

  ls: (dir) ->
    Files.where("path").startsWith(dir)

  cd: (path) ->
    if path.indexOf(SEPARATOR) is 0
      
    else
      pwd = normalizeDir join(pwd, path)

  pwd: ->
    pwd

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
