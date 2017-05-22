module.exports = (driver) ->
  SEPARATOR = "/"

  pwd = SEPARATOR

  normalizeDir = (dir) ->
    normalizePath(dir).replace(/\/?$/, SEPARATOR)

  normalizePath = (path) ->
    path.replace(/\/\/+/, SEPARATOR)
    .replace(/\/[^/]*\/\.\./g, "") # handle .. paths
    .replace(/\/\.\//g, SEPARATOR) # handle . paths

  join = (paths...) ->
    normalizePath paths.join SEPARATOR

  parsePath = (path) ->
    if path.indexOf(SEPARATOR) is 0
      normalizePath path
    else
      join(pwd, path)

  read: (path) ->
    path = parsePath path
    driver.read(path)

  write: (path, blob) ->
    path = parsePath path
    driver.write(path, blob)

  ls: (dir=pwd) ->
    dir = normalizeDir parsePath dir
    driver.list(dir)

  rm: (path) ->
    path = parsePath path
    driver.delete(path)

  cd: (path) ->
    pwd = normalizeDir parsePath path

  pwd: ->
    pwd
