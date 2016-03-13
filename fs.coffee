{log, pinvoke, startsWith, endsWith} = require "./util"

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

list = (bucket, id, dir) ->
  delimiter = "/"

  unless startsWith dir, delimiter
    dir = "#{delimiter}#{dir}"

  unless endsWith dir, delimiter
    console.log "Appending / to ", dir
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
    key = "#{id}/#{path}"
    uploadToS3 bucket, key, file
  list: (dir="/") ->
    list bucket, id, dir
