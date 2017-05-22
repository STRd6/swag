{pinvoke} = require "./util"

amazon.Login.setClientId('amzn1.application-oa2-client.29b275f9076a406c90a66b025fab96bf')

queryUserInfo = (token) ->
  fetch "https://api.amazon.com/user/profile",
    headers:
      Authorization: "bearer #{token}"
      Accept: "application/json"
  .then (response) ->
    response.json()
  .then (json) ->
    console.log json
  .catch (e) ->
    console.error e

module.exports =
  awsLogin: (options) ->
    new Promise (resolve, reject) ->
      amazon.Login.authorize options, (resp) ->
        if resp.error
          return reject resp

        console.log resp
        token = resp.access_token
        creds = AWS.config.credentials

        logins =
          'www.amazon.com': token

        creds.params.Logins = logins
        creds.expired = true

        queryUserInfo(token)

        # NOTE: This sets AWS.config.credentials as a side effect
        pinvoke AWS.config.credentials, "get"
        .then ->
          resolve logins
        , reject
