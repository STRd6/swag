Observable = require "observable"

FolderTemplate = require "../templates/folder"
FileTemplate = require "../templates/file"

FilePresenter = require "./file"

{endsWith} = require "../util"

module.exports = FolderPresenter = (data, os) ->
  {path, folders, files, name} = data
  name ?= path
  folders ?= []
  files ?= []

  self =
    Folder: (data) ->
      FolderTemplate FolderPresenter data, os
    File: (data) ->
      FileTemplate FilePresenter data, os, self
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
      os.list(path).then (results) ->
        files = results.filter (result) ->
          !endsWith(result, "/")
        folders = results.filter (result) ->
          endsWith(result, "/")

        self.files(files)
        self.folders(folders)
