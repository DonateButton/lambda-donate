"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const sns = new AWS.SNS();
const {
    putDonation,
    listDonations
} = require('./donations');

const getErrorResponse = (errors)=>
{
    return {
        statusCode: '500',
        body: JSON.stringify({result: false, error: errors.join('\n')}),
        headers: {
            'Content-Type': 'application/json',
        }
    };
};

const getResponse = (data)=>
{
    return {
        statusCode: '200',
        body: JSON.stringify({result: true, data}),
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

const sendTextMessage = ()=>
{
    return new Promise((success, failure)=>
    {
        const params = {
            Message: 'a test from Jesse lambda',
            TopicArn: 'arn:aws:sns:us-east-1:089724945947:donate-button-topic'
        };
        sns.publish(params, (err, data)=>
        {
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    });
};


const handler = (event, context, callback) =>
{
    if(_.isNil(callback) === true)
    {
        return getErrorResponse(['No callback was passed to the handler.']);
    }

    if(_.isNil(context) === true)
    {
        return getErrorResponse(['No context was passed to the handler.']);
    }

    // send a text message

    // return sendTextMessage()
    // .then(result =>
    // {
    //      callback(undefined, 'sup');
    // })
    // .catch(error =>
    // {
    //     callback(error);
    // });

    // list the tables in DynamoDB

    // return new Promise((success, failure)=>
    // {
    //     dynamodb.listTables({}, (err, data)=>
    //     {
    //         log("err:", err);
    //         log("data:", data);
    //         if(err)
    //         {
    //             return failure(err);
    //         }
    //         return success(data);
    //     });
    // });
   
   // putDonation
//    return putDonation(5);

    return listDonations();
};

module.exports = {
    handler
};

handler({}, {}, ()=>{})
.then(result =>
{
    log("result:", result);
})
.catch(error =>
{
    log("error:", error);
});