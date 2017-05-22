module.exports =
  log: (obj, rest...) ->
    console.log obj, rest...
    return obj

  # TODO: Hook into progress where possible: .on 'httpUploadProgress'
  pinvoke: (object, method, params...) ->
    new Promise (resolve, reject) ->
      object[method] params..., (err, result) ->
        if err
          reject err
          return

        resolve result

  startsWith: (str, prefix) ->
    str.lastIndexOf(prefix, 0) is 0

  endsWith: (str, suffix) ->
    str.indexOf(suffix, str.length - suffix.length) != -1

  emptyElement: (element) ->
    while element.lastChild
      element.lastChild.remove()

  readAsText: (file) ->
    new Promise (resolve, reject) ->
      reader = new FileReader
      reader.onload = ->
        resolve reader.result
      reader.onerror = reject
      reader.readAsText(file)

  uniq: (array) ->
    Array.from new Set array

  htmlEscape: (string) ->
    String(string).replace /[&<>"'\/]/g, (s) ->
      entityMap[s]

entityMap =
  "&": "&amp;"
  "<": "&lt;"
  ">": "&gt;"
  '"': '&quot;'
  "'": '&#39;'
  "/": '&#x2F;'
