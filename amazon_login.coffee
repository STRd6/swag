window.onAmazonLoginReady = ->
  amazon.Login.setClientId('amzn1.application-oa2-client.29b275f9076a406c90a66b025fab96bf')

do (d=document) ->
  r = d.createElement 'div'
  r.id = "amazon-root"
  d.body.appendChild r
  a = d.createElement('script')
  a.type = 'text/javascript'
  a.async = true
  a.id = 'amazon-login-sdk'
  a.src = 'https://api-cdn.amazon.com/sdk/login1.js'
  r.appendChild(a)
