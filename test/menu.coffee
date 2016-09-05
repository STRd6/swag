parse = require "../lib/indent-parse"

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
