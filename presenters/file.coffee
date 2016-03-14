module.exports = FilePresenter = (data, fs, os) ->
  {name, path} = data

  name: name
  path: path
  click: (e) ->
    e.filetreeHandled = true

    os.open path

    return
