parse = require "../lib/indent-parse"

module.exports = parse """
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
