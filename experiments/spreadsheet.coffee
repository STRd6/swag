style = document.createElement "style"
style.innerHTML = require "../style"
document.head.appendChild style

data = [0...100].map (i) ->
  id: i
  name: "yolo"

TablePresenter = (data) ->
  headers = Object.keys data[0]

  headers: headers
  rows: data.map (datum) ->
    cells: Object.keys(datum).map (key) -> datum[key]

TableTemplate = require "../templates/table"

document.body.appendChild TableTemplate TablePresenter data
