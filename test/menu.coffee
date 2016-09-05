top = (stack) ->
  stack[stack.length - 1]

parse = (source) ->
  stack = [[]]
  indentation = /^(  )*/
  depth = 0

  source.split("\n").forEach (line, lineNumber) ->
    match = line.match(indentation)[0]
    text = line.replace(match, "")
    newDepth = match.length / 2

    return unless text.trim().length
    current = text

    if newDepth > depth
      assert newDepth is depth + 1
      # We're one level further in
      # Convert the simple string to a [label, items] pair
      items = []
      prev = top(stack)
      prev.push [prev.pop(), items]
      stack.push items
    else if newDepth < depth
      # Pop stack to correct depth
      stack = stack.slice(0, newDepth + 1)

    depth = newDepth

    top(stack).push current

  return stack[0]

describe "Menu Parser", ->
  it "should parse menus into lists", ->
    data = """
      File
    """

    results = parse(data)
    assert.deepEqual ["File"], results

  it "should parse empty", ->
    data = """
    """

    assert.deepEqual [], parse(data)

  it "should deal with nesting ok", ->
    data = """
      File
        Open
        Save
      Edit
        Copy
        Paste
      Help
    """

    results = parse(data)
    assert.deepEqual [
      ["File", ["Open", "Save"]]
      ["Edit", ["Copy", "Paste"]]
      "Help"
    ], results

  it "should parse big ol' menus", ->
    results = parse """
      File
        New
        Open
        Save
        Save As
      Edit
        Undo
        Redo
        -
        Cut
        Copy
        Paste
        Delete
        -
        Find
        Find Next
        Replace
        Go To
        -
        Select All
        Time/Date
      Format
        Word Wrap
        Font...
      View
        Status Bar
      Help
        View Help
        -
        About Notepad
    """

    assert.deepEqual [
      ["File", ["New", "Open", "Save", "Save As"]]
      ["Edit", ["Undo", "Redo", "-", "Cut", "Copy", "Paste", "Delete", "-", "Find", "Find Next", "Replace", "Go To", "-", "Select All", "Time/Date"]]
      ["Format", ["Word Wrap", "Font..."]]
      ["View", ["Status Bar"]]
      ["Help", ["View Help", "-", "About Notepad"]]
    ], results

  it "should parse hella nested menus", ->
    results = parse """
      File
        Special
          Nested
            Super
              Awesome
    """

    assert.deepEqual [
      ["File", [
        ["Special", [
          ["Nested", [
            ["Super", [
              "Awesome"
            ]]
          ]]
        ]]
      ]]
    ], results
