urlSafeBase64 = (base64) ->
  base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=*$/, '')

arrayBufferToBase64 = (buffer) ->
  bytes = new Uint8Array(buffer)

  binary = ""

  bytes.forEach (byte) ->
    binary += String.fromCharCode(byte)

  return btoa(binary)

shaForBlob = (blob) ->
  new Promise (resolve, reject) ->
    reader = new FileReader

    reader.onload = ->
      buffer = reader.result
      crypto.subtle.digest("SHA-256", buffer)
      .then resolve
      .catch reject

    reader.onerror = reject

    reader.readAsArrayBuffer(blob)

demo = ->
  ["yolo", "duder", "hello", "wat"].forEach (test) ->
    blob = new Blob [test]

    shaForBlob(blob)
    .then arrayBufferToBase64
    .then urlSafeBase64
    .then log

module.exports = (blob) ->
  shaForBlob(blob)
  .then arrayBufferToBase64
  .then urlSafeBase64
c