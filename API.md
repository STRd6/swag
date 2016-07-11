OS
===

These OS methods are exposed to apps via postMessage.

`saveFile`
----------

`saveFile blob, [path]`

Saves a file to the file system.

Prompts for a path if no path is given.

Prompts for override if a file exists at that path.


`openFile`
----------

`openFile options`

Display the OS file chooser.

Returns a promise that is fulfilled with the selected file or rejected if
cancelled.


`readFile`
----------

`readFile path`

Read a file from the system.

Returns a promise fulfilled with a blob or rejected with an error.

`list`
------

`list path`

List directory contents. Returns a promise fulfilled with a directory listing

    path: ""
    folders: ["",...]
    files: ["",...]


`send`
------

`send appId, method, args...`

Send a message to another app.

App
===

These App methods are exposed to the OS to handle file interactions, user
interactions and App<->App interactions.

Drop File

`loadFile blob`

Drop Directory

`loadDirectory directoryListing`


FS Notifications
----------------

Should be able to subscribe to notifications when file/directory contents change.


Standard Streams and Backpressure
---------------------------------

Apps should be able to read data as a stream. Streams should block and wait if
the process gets backed up. The blockage should propagate back reducing the output
of the upstream processes. When the process becomes unblocked the upstream will
unblock as well.

Just doodling...

Handler is called when data is written to the stream from the source. The
handler won't be called again until `next` is called. If `next` is called with
an error the error will be propagated back.

Data can be any JS atom that can survive `postMessage`.[1]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

    inputStream.attach (data, next) ->
      outputStream.write(data)
      .then ->
        next()
      .catch (e) ->
        next(e)

    inputStream.attach (data, next) ->
      outputStream.write(data, next)

Cat

    STDIN (data, next) ->
      STDOUT(data, next)

Split

Duplicate an input to two output streams

    STDIN (data, next) ->
      fn1 = null
      fn2 = null

      p1 = new Promise (resolve, reject) ->
        fn1 = (arg) ->
          if arguments.length
            reject arg
          else
            resolve()

      p2 = ...

      Promise.all [p1, p2]
      .then next

      outStream1.write(data, f1)
      outStream2.write(data, f2)

Join

TODO: This could write one extra atom before backing up...
Probably need to keep track of a promise for pending writes to wait on before
writing again.

    S1 (data, next) ->
      out data, next

    S2 (data, next) ->
      out data, next
