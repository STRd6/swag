
Observable = require "observable"

TextEditor = require "./text_editor"

EditorTemplate = require "./templates/editor"
FolderTemplate = require "./templates/folder"
FolderPresenter = require "./presenters/folder"

module.exports = ->
  appHandlers =
    "^text": (file, path) ->
      editor = TextEditor(self)
  
      reader = new FileReader
  
      reader.onload = ->
        editor.contents reader.result
        editor.contentType result.type
        editor.path path
  
      reader.onerror = (e) ->
        console.error e
  
      reader.readAsText(file)
  
      return EditorTemplate editor
  
    "^image": (file) ->
      img = document.createElement "img"
      img.src = URL.createObjectURL(file)
  
      return img

  self =
    editorElement: Observable()
  
    fileTreeElement: Observable()
  
    attachFS: (fs) ->
      self.fileTreeElement FolderTemplate FolderPresenter {path: "/"}, fs, self

      self.fs = -> fs
  
    open: (path) ->
      self.fs().get(path)
      .then (file) ->
        type = file.type
        handled = false
        Object.keys(appHandlers).forEach (matcher) ->
          return if handled
  
          handler = appHandlers[matcher]
          regex = new RegExp(matcher)
  
          if regex.test(type)
            handled = true
            appElement = handler(file, path)
  
            self.editorElement appElement

    put: (path, file) ->
      self.fs().put path, file
