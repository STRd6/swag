module.exports = FilePresenter = (data, fs) ->
  {name, path} = data

  name: name
  path: path
  click: (e) ->
    e.filetreeHandled = true

    return
