{log, pinvoke, startsWith, endsWith} = require "./util"

delimiter = "/"

status = (response) ->
  if response.status >= 200 && response.status < 300
    return response
  else
    throw response

json = (response) ->
  response.json()

blob = (response) ->
  response.blob()

uploadToS3 = (bucket, key, file, options={}) ->
  {cacheControl} = options

  cacheControl ?= 0

  pinvoke bucket, "putObject",
    Key: key
    ContentType: file.type
    Body: file
    CacheControl: "max-age=#{cacheControl}"

getFromS3 = (bucket, key) ->
  fetch("https://#{bucket.config.params.Bucket}.s3.amazonaws.com/#{key}")
  .then status
  .then blob

deleteFromS3 = (bucket, key) ->
  pinvoke bucket, "deleteObject",
    Key: key

list = (bucket, id, dir) ->
  unless startsWith dir, delimiter
    dir = "#{delimiter}#{dir}"

  unless endsWith dir, delimiter
    dir = "#{dir}#{delimiter}"

  prefix = "#{id}#{dir}"

  pinvoke bucket, "listObjects",
    Prefix: prefix
    Delimiter: delimiter
  .then (result) ->
    path: prefix.replace(id, "")
    folders: result.CommonPrefixes.map (p) ->
      p.Prefix.replace(prefix, "")
    files: result.Contents.map (o) ->
      o.Key.replace(prefix, "")

module.exports = (id, bucket) ->
  get: (path) ->
    unless startsWith path, delimiter
      path = delimiter + path

    key = "#{id}#{path}"

    getFromS3(bucket, key)

  put: (path, file) ->
    unless startsWith path, delimiter
      path = delimiter + path

    key = "#{id}#{path}"

    uploadToS3 bucket, key, file

  delete: (path) ->
    unless startsWith path, delimiter
      path = delimiter + path

    key = "#{id}#{path}"

    deleteFromS3 bucket, key

  list: (dir="/") ->
    list bucket, id, dir
