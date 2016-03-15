module.exports = (fs) ->
  self =
    contents: Observable "Hello"
    contentType: Observable "text/plain"
    path: Observable "test.txt"
    save: ->
      blob = new Blob [self.contents()], type: self.contentType()
      fs.put self.path(), blob
