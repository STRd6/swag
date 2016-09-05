{htmlEscape} = require "../util"

Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
MenuSeparator = require "../templates/menu-separator"

isDescendant = (element, ancestor) ->
  return unless element

  while (parent = element.parentElement)
    return true if element is ancestor
    element = parent

formatAction = (labelText) ->
  str = labelText.replace(/[^A-Za-z0-9]/g, "")
  str.charAt(0).toLowerCase() + str.substring(1)

formatLabel = (labelText) ->
  # Parse out accelerator keys for underlining when alt is pressed
  labelHTML = htmlEscape(labelText).replace(/\[([^\]]+)\]/, "<span class=\"accelerator\">$1</span>")

  label = document.createElement "label"
  label.innerHTML = labelHTML

  return label

MenuItemView = (item, application) ->
  active = Observable false

  if Array.isArray(item) # Submenu
    [label, items] = item

    # TODO: Move this out to a single handler
    document.addEventListener "mousedown", (e) ->
      unless isDescendant(e.target, element)
        active false

    element = MenuItemTemplate
      class: ->
        [
          "menu"
          "active" if active()
        ]
      click: ->
        active true
      mouseover: (e) -> # TODO: Want to hide and show the correct menus so you can hover around to view them
        unless isDescendant(e.fromElement, element)
          active true
      mouseout: (e) ->
        unless isDescendant(e.toElement, element)
          active false
      label: formatLabel label
      content: MenuTemplate
        class: "options"
        items: items.map (item) ->
          MenuItemView(item, application)

  else
    if item is "-" # separator
      MenuSeparator()
    else
      # TODO: Optionally parse out custom action symbol from entries like:
      #
      #     [F]ont... -> showFont
      action = formatAction item
      MenuItemTemplate
        click: ->
          # TODO: Optionally hook in to Action objects so we can display hotkeys
          # and enabled/disabled statuses.
          application[action]()
        label: formatLabel item
        mouseover: (e) -> # TODO: Want to hide and show the correct menus so you can hover around to view them
          unless isDescendant(e.fromElement, element)
            active true
        mouseout: (e) ->
          unless isDescendant(e.toElement, element)
            active false
        class: ->
          [
            "active" if active()
          ]
        content: null

module.exports = (data, application) ->
  acceleratorActive = Observable false
  # Track active menus and item for navigation
  activeItem = Observable null
  previouslyFocusedElement = null

  menuItems = data.map (item) ->
    MenuItemView(item, application)

  element = MenuTemplate
    items: menuItems
    log: (e) ->
      console.log e
    class: ->
      [
        "menu-bar"
        "accelerator-active" if acceleratorActive()
      ]

  document.addEventListener "mousedown", (e) ->
    unless isDescendant(e.target, element)
      acceleratorActive false

  # TODO: Add keyboard navigation to menus when accelerating and also in general
  document.addEventListener "keydown", (e) ->
    console.log e
    {key} = e
    switch key
      when "Alt"
        menuIsActive = false
        if acceleratorActive() or menuIsActive
          acceleratorActive false
          # De-activate menu and focus previously focused element
          previouslyFocusedElement?.focus()
        else
          # Store previously focused element
          # Get menu ready for accelerating!
          previouslyFocusedElement = document.activeElement
          element.focus()
          acceleratorActive true
      when "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"
        if acceleratorActive()
          e.preventDefault()
          direction = key.replace("Arrow", "")
          ;#TODO: move cursor
          console.log direction
      when "Escape"
        console.log key
      else
        # TODO: Check Accelerator keys to jump to menu

  element: element

###
li.menu.active
  span File
  ul.options
    li Open
    li Save
###