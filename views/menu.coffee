{htmlEscape} = require "../util"

Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
MenuSeparator = require "../templates/menu-separator"

A = (attr) ->
  (x) -> x[attr]

asElement = A('element')

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

MenuItemView = (item, handler, parent, activeItem) ->
  active = ->
    isDescendant activeItem()?.element, element

  self =
    element: null
    active: null

  if item is "-" # separator
    element = MenuSeparator()
  else
    if Array.isArray(item) # Submenu
      [label, items] = item

      click = -> activeItem self
      content = MenuTemplate
        class: "options"
        items: items.map (item) ->
          MenuItemView(item, handler, self, activeItem).element
        log: console.log

    else
      label = item

      # TODO: Optionally parse out custom action symbol from entries like:
      #
      #     [F]ont... -> showFont
      actionName = formatAction label
      click = ->
        # TODO: Optionally hook in to Action objects so we can display hotkeys
        # and enabled/disabled statuses.
        try
          handler[actionName]()
        catch e
          console.error e

    element = MenuItemTemplate
      log: console.log.bind console
      class: ->
        [
          "menu" if items
          "active" if active()
        ]
      click: click
      mouseover: (e) -> # TODO: Want to hide and show the correct menus so you can hover around to view them
        console.log e
        if isDescendant(e.target, element) and !e.defaultPrevented
          e.preventDefault() # TODO: Find out what the default mouseover event 
          # actually does! We're just using this to prevent handling the activation 
          # above the first element that handles it
          console.log "active!", element, e.target
          activeItem self
      mouseout: (e) ->
        unless isDescendant(e.toElement, element)
          active false
      keydown: (e) ->
        console.log "DOWN", e
      label: formatLabel label
      content: content

  self.element = element
  self.active = active

  return self

module.exports = (data, application) ->
  acceleratorActive = Observable false
  # Track active menus and item for navigation
  activeItem = Observable null
  previouslyFocusedElement = null

  self =
    element: null

  menuItems = data.map (item) ->
    MenuItemView(item, application, self, activeItem)

  # Dispatch the key to the active menu element
  accelerate = (key) ->
    activeItem().accelerate(key)

  element = MenuTemplate
    items: menuItems.map asElement
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
      activeItem null

  # TODO: Add keyboard navigation to menus when accelerating and also in general
  document.addEventListener "keydown", (e) ->
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
          activeItem self
          acceleratorActive true
  
  element.addEventListener "keydown", (e) ->
    {key} = e

    console.log "TOPDOWN", e

    switch key
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
        if acceleratorActive()
          accelerate key

  self.element = element

  return self

###
li.menu.active
  span File
  ul.options
    li Open
    li Save
###
