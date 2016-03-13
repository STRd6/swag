\*S\*W\*A\*G\*

Let's use AWS Cognito to be all serverless all the time!

    require "./aws"

    require "./amazon_login"
    document.body.appendChild require("./templates/login")()

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

    document.getElementById('LoginWithAmazon').onclick = ->
      options = { scope : 'profile' }
      amazon.Login.authorize options, (resp) ->
        if !resp.error
          token = resp.access_token
          creds = AWS.config.credentials

          creds.params.Logins =
            'www.amazon.com': token

          creds.expired = true

          queryUserInfo(token)

          AWS.config.credentials.get (err) ->
            return console.error err if err

            console.log AWS.config.credentials

      return false
