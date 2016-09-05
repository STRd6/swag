Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
MenuSeparator = require "../templates/menu-separator"
SubmenuTemplate = require "../templates/submenu"

isDescendant = (element, ancestor) ->
  while (parent = element.parentElement)
    return true if element is ancestor
    element = parent

Presenter = (data) ->
  
MenuItemView = (item) ->
  active = Observable false

  if Array.isArray(item) # Submenu
    [label, items] = item

    SubmenuTemplate
      class: "menu"
      activeClass: ->
        "active" if active()
      click: ->
        active true
      mouseover: (e) ->
        console.log "over", e
        # active true
      mouseout: (e) ->
        console.log "out", e
      label: label
      content: items.map MenuItemView

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

  menuItems = data.map MenuItemView

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
