Observable = require "observable"

FolderTemplate = require "../templates/folder"
FileTemplate = require "../templates/file"

FilePresenter = require "./file"

module.exports = FolderPresenter = (data, fs, os) ->
  {path, folders, files, name} = data
  name ?= path
  folders ?= []
  files ?= []

  self =
    Folder: (data) ->
      FolderTemplate FolderPresenter data, fs, os
    File: (data) ->
      FileTemplate FilePresenter data, fs, os, self
    class: ->
      "expanded" if self.expanded()
    click: (e) ->
      return if e.filetreeHandled
      e.filetreeHandled = true

      self.expanded.toggle()
      if self.expanded()
        self.refresh()

      return false
    expanded: Observable false
    folders: Observable folders
    files: Observable files
    name: name
    path: path
    refresh: ->
      console.log "List:", path
      fs.list(path).then ({files, folders}) ->
        self.files(files)
        self.folders(folders)
