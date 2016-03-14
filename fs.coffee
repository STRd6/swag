{log, pinvoke, startsWith, endsWith} = require "./util"

delimiter = "/"

status = (response) ->
  if response.status >= 200 && response.status < 300
    return response
  else
    throw response

json = (response) ->
  response.json()

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
  .then (response) ->
    contentType = response.headers.get('Content-Type')

    if contentType.match /^text/
      response.text()
    else if contentType.match /json$/
      response.json()
    else
      response.blob()

list = (bucket, id, dir) ->
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