Observable = require "observable"

module.exports = (os) ->
  self =
    contents: Observable "Hello"
    contentType: Observable "text/plain"
    path: Observable "test.txt"
    save: ->
      blob = new Blob [self.contents()], type: self.contentType()
      os.put self.path(), blob
