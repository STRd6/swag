style = document.createElement "style"
style.innerHTML = require "../style"
document.head.appendChild style

Clusterize = require "../lib/clusterize"

data = [0...1000].map (i) ->
  id: i
  name: "yolo"

RowTemplate = require "../templates/row"

TablePresenter = (data) ->
  headers = Object.keys data[0]

  headers: headers
  rows: data.map (datum) ->
    cells: Object.keys(datum).map (key) -> 
      datum[key]
  renderRow: (row) ->
    RowTemplate(row)

TableTemplate = require "../templates/table"

containerElement = TableTemplate TablePresenter data
tableBody = containerElement.children[0].children[1]

clusterize = new Clusterize
  scrollElem: containerElement
  contentElem: tableBody

document.body.appendChild containerElement
clusterize.refresh()
