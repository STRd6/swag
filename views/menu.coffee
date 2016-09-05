Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
SubmenuTemplate = require "../templates/submenu"

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
      label: label
      content: items.map MenuItemView

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
