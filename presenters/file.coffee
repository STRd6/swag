module.exports = FilePresenter = (data, fs, os) ->
  {name, path} = data

  name: name
  path: path
  click: (e) ->
    return if e.filetreeHandled
    e.filetreeHandled = true

    os.open path

    return

  remove: (e) ->
    return if e.filetreeHandled
    e.filetreeHandled = true

    os.delete path

    return
