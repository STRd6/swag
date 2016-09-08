{htmlEscape} = require "../util"

Observable = require "observable"

MenuTemplate = require "../templates/menu"
MenuItemTemplate = require "../templates/menu-item"
MenuSeparator = require "../templates/menu-separator"

A = (attr) ->
  (x) -> x[attr]

asElement = A('element')

advance = (list, currentItem, amount) ->
  activeItemIndex = list.indexOf(currentItem) + amount

  if activeItemIndex < 0
    activeItemIndex = list.length - 1
  else if activeItemIndex >= list.length
    activeItemIndex = 0

  list[activeItemIndex]

isDescendant = (element, ancestor) ->
  return unless element

  while (parent = element.parentElement)
    return true if element is ancestor
    element = parent

formatAction = (labelText) ->
  str = labelText.replace(/[^A-Za-z0-9]/g, "")
  str.charAt(0).toLowerCase() + str.substring(1)

formatLabel = (labelText) ->
  accelerator = undefined
  # Parse out accelerator keys for underlining when alt is pressed
  labelHTML = htmlEscape(labelText).replace /\[([^\]]+)\]/, (match, $1) ->
    accelerator = $1.toLowerCase()
    "<span class=\"accelerator\">#{$1}</span>"

  label = document.createElement "label"
  label.innerHTML = labelHTML

  return [label, accelerator]

accelerateItem = (items, key) ->
  [acceleratedItem] = items.filter (item) ->
    item.accelerator is key

  if acceleratedItem
    # TODO: should there be some kind of exec rather than click action?
    acceleratedItem.click()

SeparatorView = ->
  element: MenuSeparator()
  separator: true

MenuItemView = (item, handler, parent, activeItem) ->
  return SeparatorView() if item is "-" # separator

  self =
    accelerate: null
    element: null
    active: null
    cursor: null
    click: null
    items: null

  # TODO: This gets called per menu item when the state changes
  # Could we shift it a little to only be called for the relevant subtree?
  active = ->
    isDescendant activeItem()?.element, element

  if Array.isArray(item) # Submenu
    [label, items] = item

    self.accelerate = (key) ->
      accelerateItem(items, key)

    self.cursor = (direction) ->
      switch direction
        when "Up"
          activeItem advance(navigableItems, activeItem(), -1)
        when "Down"
          activeItem advance(navigableItems, activeItem(), 1)
        when "Left" # TODO: Fix left and right cursor nav in submenus
          activeItem advance(parent.items, self, -1)
        when "Right"
          activeItem advance(parent.items, self, 1)

    items = items.map (item) ->
      MenuItemView(item, handler, self, activeItem)

    navigableItems = items.filter (item) ->
      !item.separator

    self.items = items
    click = -> activeItem self
    content = MenuTemplate
      class: "options"
      items: items.map (item) ->
        item.element
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
      handler[actionName]?()
      activeItem null

    self.cursor = parent.cursor
    self.accelerate = parent.accelerate

  [label, accelerator] = formatLabel label

  element = MenuItemTemplate
    class: ->
      [
        "menu" if items
        "active" if active()
      ]
    click: click
    mouseover: (e) ->
      # TODO: Click to activate top level menus unless a menu is already active
      # then hover to show.
      if isDescendant(e.target, element) and !e.defaultPrevented
        e.preventDefault()
        # TODO: Find out what the default mouseover event 
        # actually does! We're just using this to prevent handling the activation 
        # above the first element that handles it
        activeItem self
    # TODO: We'll need to add a mousemove event to catch the times when
    # you use the arrow keys to advance the cursor then move the mouse
    # while staying on the previously active element. This may be able to
    # replace mouseover.
    mouseout: (e) -> # TODO: How should we really handle mouseout?
      unless isDescendant(e.toElement, element)
        active false
    keydown: (e) ->
      ;#console.log "DOWN", e
    label: label
    content: content

  self.click = click
  self.accelerator = accelerator
  self.element = element
  self.active = active

  return self

# TODO: Can this be combined with MenuItemView to reduce some redundancy at the
# top level?
module.exports = (data, application) ->
  acceleratorActive = Observable false
  # Track active menus and item for navigation
  activeItem = Observable null
  previouslyFocusedElement = null

  self =
    element: null
    accelerate: (key) ->
      accelerateItem menuItems, key
    items: null

  self.items = menuItems = data.map (item) ->
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

  deactivate = ->
    activeItem null
    acceleratorActive false
    # De-activate menu and focus previously focused element
    previouslyFocusedElement?.focus()

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
          deactivate()
        else
          # Store previously focused element
          # Get menu ready for accelerating!
          previouslyFocusedElement = document.activeElement
          element.focus()
          activeItem self unless activeItem()
          acceleratorActive true

  element.addEventListener "keydown", (e) ->
    {key} = e

    switch key
      when "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"
        e.preventDefault()
        direction = key.replace("Arrow", "")
        activeItem().cursor(direction)
      when "Escape"
        deactivate()
      else
        accelerate key.toLowerCase() if acceleratorActive()

  self.element = element

  return self
