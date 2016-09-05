DSL For Creating Menus
======================

Example from Notepad

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

Top level menus are not indented, their options are indented beneath them.
Separators are indicated by `-`. Submenus can be indented further:

    File
      New
      Open
      Save
      -
      Import
        Audio...
        Labels...
        MIDI...
        Raw Data...
      -

Windows seems to use `...` after options to indicate that the option will open
a window for further configuration.