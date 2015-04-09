global.pubnub = PUBNUB.init
  publish_key: 'pub-c-010c4d6a-9e0f-43cc-87d3-d8e5ac1fb605'
  subscribe_key: 'sub-c-df841964-de59-11e4-a1d1-0619f8945a4f'

pub = ->
  console.log "yolo"
  pubnub.publish
    channel: 'demo_tutorial'
    message:
      color: "blue"

pubnub.subscribe
  channel: 'demo_tutorial'
  message: ->
    console.log "Message", arguments
  connect: ->
    console.log "Connect", arguments
    pub()
  disconnect: ->
    console.log "Disconnect", arguments
  error: ->
    console.error "Error", arguments

console.log "wat?"
