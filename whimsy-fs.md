\*S\*W\*A\*G\*
==============

Let's use AWS Cognito to be all serverless all the time!

Use S3 as a filesystem.

urls can be constructed by

       https://s3.amazonaws.com/#{bucket}/#{userId}/#{sha}
    -> https://#{base_cdn}/#{userId}/#{sha}
       https://#{user_cdn}/#{sha}

Pricing: https://aws.amazon.com/s3/pricing/

S3 Bucket Config
----------------

You need to set up CORS on the S3 Bucket to allow posting from the browser

    <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01">
       <CORSRule>
          <AllowedOrigin>*</AllowedOrigin>
          <AllowedMethod>GET</AllowedMethod>
          <AllowedMethod>PUT</AllowedMethod>
          <AllowedMethod>POST</AllowedMethod>
          <AllowedMethod>DELETE</AllowedMethod>
          <AllowedHeader>*</AllowedHeader>
       </CORSRule>
    </CORSConfiguration>

Set up public read policy on S3 Bucket

    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Principal": "*",
    			"Action": [
    				"s3:GetObject"
    			],
    			"Resource": [
    				"arn:aws:s3:::whimsy-fs/*"
    			]
    		}
    	]
    }

Cloudfront Config
-----------------

https only

Point at S3 bucket

Enable options and whitelist headers for CORS


Route53 Config
--------------

fs.whimsy.space

Create A (Alias record) pointing to cloudfront distribution


AWS Cognito User Policy
-----------------------

    {
        "Version": "2012-10-17",
        "Statement": [
            {
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
                    "arn:aws:dynamodb:us-east-1:186123361267:table/whimsy-fs"
                ],
                "Condition": {
                    "ForAllValues:StringEquals": {
                        "dynamodb:LeadingKeys": [
                            "${cognito-identity.amazonaws.com:sub}"
                        ]
                    }
                }
            },
            {
                "Action": [
                    "s3:ListBucket"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::whimsy-fs"
                ],
                "Condition": {
                    "StringLike": {
                        "s3:prefix": [
                            "${cognito-identity.amazonaws.com:sub}/*"
                        ]
                    }
                }
            },
            {
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::whimsy-fs/${cognito-identity.amazonaws.com:sub}/*"
                ]
            }
        ]
    }

Using Amazon Login for Auth
---------------------------

Could also instead use FB, Google, pretty much any OAuth

Set up app at https://sellercentral.amazon.com/gp/homepage.html the interface is
hideous yet functional.

Update Cognito Identity Pool with Amazon App Id

Optionally add Twitter, Goog, FB, etc.


Discontinued Tangents
=====================

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

S3 path is "${cognito-identity.amazonaws.com:sub}/#{sha}"

DynamoDB path is logical path ex: /Desktop/yolo.png
owner is "${cognito-identity.amazonaws.com:sub}"
createdAt number: unix epoch timestamp
sha is the same sha that matches s3
arbitrary extra meta data can be added

