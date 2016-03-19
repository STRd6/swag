Postmaster = require "postmaster"

module.exports = (os, file, path) ->
  frame = document.createElement "iframe"
  frame.sandbox = "allow-scripts allow-modals"

  postmaster = Postmaster {},
    remoteTarget: -> frame.contentWindow
    childLoaded: ->
      postmaster.invokeRemote "fromBlob", file
    save: ({image}) ->
      newPath = prompt "Save As", path

      if newPath
        path = newPath
        os.put path, image

  frame.src = "https://danielx.net/pixel-editor/embedded/"

  frame
