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

formatLabel = (labelText) ->
  # TODO: Parse out accelerator keys for underlining when alt is pressed
  # TODO: This is an XSS opportunity if we don't trust the menu text
  labelHTML = labelText.replace(/\[([^\]]+)\]/, "<span class=\"accelerator\">$1</span>")

  label = document.createElement "label"
  label.innerHTML = labelHTML

  console.log label

  return label

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
      label: formatLabel label
      content: items.map (item) ->
        MenuItemView(item)

  else
    if item is "-" # separator
      MenuSeparator()
    else
      MenuItemTemplate
        click: ->
          console.log item
        label: formatLabel item

module.exports = (data) ->
  presenter = Presenter(data)

  menuItems = data.map (item) ->
    MenuItemView(item)

  element = MenuTemplate
    items: menuItems

  # TODO: Add keyboard navigation to menus when accelerating and also in general
  document.addEventListener "keydown", (e) ->
    console.log e
    {key} = e
    if key is "Alt"
      element.classList.toggle("accelerator-active")

  element: element

###
li.menu.active
  span File
  ul.options
    li Open
    li Save
###
