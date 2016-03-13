\*S\*W\*A\*G\*

Let's use AWS Cognitor to be all serverless all the time!

    require "./aws"

    require "./amazon_login"
    document.body.appendChild require("./templates/login")()

    document.getElementById('LoginWithAmazon').onclick = ->
      options = { scope : 'profile' }
      amazon.Login.authorize options, (resp) ->
        if !resp.error
          debugger
          creds = AWS.config.credentials

          creds.params.Logins =
            'www.amazon.com': resp.access_token

          creds.expired = true

          AWS.config.credentials.get (err) ->
            return console.error err if err

            console.log AWS.config.credentials

      return false
