top = (stack) ->
  stack[stack.length - 1]

parse = (source) ->
  stack = [[]]
  indentation = /^(  )*/
  depth = 0

  source.split("\n").forEach (line, lineNumber) ->
    match = line.match(indentation)[0]
    text = line.replace(match, "")
    newDepth = match.length / 2

    return unless text.trim().length
    current = text

    if newDepth > depth
      unless newDepth is depth + 1
        throw new Error "Unexpected indentation on line #{lineNumber}"
      # We're one level further in
      # Convert the simple string to a [label, items] pair
      items = []
      prev = top(stack)
      prev.push [prev.pop(), items]
      stack.push items
    else if newDepth < depth
      # Pop stack to correct depth
      stack = stack.slice(0, newDepth + 1)

    depth = newDepth

    top(stack).push current

  return stack[0]

module.exports = parse
