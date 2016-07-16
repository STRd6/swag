Postmaster = require "postmaster"

module.exports = (os, file, path) ->
  frame = document.createElement "iframe"
  frame.sandbox = "allow-scripts allow-modals"

  postmaster = Postmaster
    remoteTarget: -> frame.contentWindow

    # Action to perform when the editor is loaded
    childLoaded: ->
      postmaster.invokeRemote "loadFile", file
      frame.contentWindow.focus()

      return

    # Action for the 'Save' button inside the editor
    save: ({image}) ->
      newPath = prompt "Save As", path

      if newPath
        path = newPath
        os.put path, image

      return

  frame.src = "https://danielx.net/pixel-editor/embedded/"

  frame
