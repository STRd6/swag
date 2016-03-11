Whimsy FS
=========

DynamoDB Semantic Records linking to S3 Content Addressable Store

DynamoDB Table

      Primary keys     Index    Link to CAS
        |       |        |           |
    +-------+------+-----------+----------+------------------------
    | owner | path | createdAt |    sha   |  extra... (tags, etc.)


Saving a File
-------------

sha is base64 url-encoded sha256 of file contents

Compute sha, save to S3 and DynamoDB

S3 path is "${cognito-identity.amazonaws.com:sub}/data/#{sha}"

DynamoDB path is logical path ex: /Desktop/yolo.png
owner is "${cognito-identity.amazonaws.com:sub}"
createdAt number: unix epoch timestamp
sha is the same sha that matches s3

urls can be constructed by

    https://s3.amazonaws.com/#{bucket}/#{userId}/data/#{sha}
    https://#{base_cdn}/#{userId}/data/#{sha}
    https://#{personal_cdn}/data/#{sha}
    https://#{data_cdn}/#{sha}

DynamoDB Access controls
------------------------

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Stmt1428459474000",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:BatchGetItem",
                    "dynamodb:Query",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:BatchWriteItem"
                ],
                "Resource": [
                    "arn:aws:dynamodb:us-east-1:186123361267:table/swag"
                ],
                "Condition": {
                    "ForAllValues:StringEquals": {
                        "dynamodb:LeadingKeys": [
                            "${cognito-identity.amazonaws.com:sub}"
                        ]
                    }
                }
            }
        ]
    }
