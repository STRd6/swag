Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
MenuSeparator = require "../templates/menu-separator"
SubmenuTemplate = require "../templates/submenu"

isDescendant = (element, ancestor) ->
  return unless element

  while (parent = element.parentElement)
    return true if element is ancestor
    element = parent

Presenter = (data) ->
  
MenuItemView = (item) ->
  active = Observable false

  if Array.isArray(item) # Submenu
    [label, items] = item

    document.addEventListener "mousedown", (e) ->
      unless isDescendant(e.target, element)
        active false

    element = SubmenuTemplate
      class: "menu"
      activeClass: ->
        "active" if active()
      click: ->
        active true
      mouseover: (e) -> # TODO: Want to hide and show the correct menus so you can hover around to view them
        unless isDescendant(e.fromElement, element)
          console.log "over", e
          # active true
      mouseout: (e) ->
        unless isDescendant(e.toElement, element)
          console.log "out", e
          # active false
      label: label
      content: items.map (item) ->
        MenuItemView(item)

  else
    if item is "-" # separator
      MenuSeparator()
    else
      MenuItemTemplate
        click: ->
          console.log item
        label: item

module.exports = (data) ->
  presenter = Presenter(data)

  menuItems = data.map (item) ->
    MenuItemView(item)

  element = MenuTemplate
    items: menuItems

  element: element

###
li.menu.active
  span File
  ul.options
    li Open
    li Save
###
