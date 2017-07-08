"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const sns = new AWS.SNS();
const {
    listUsers,
    sanitizeUser
} = require('./user');
const {
    listAccounts
} = require('./account');
const {
    listSettings
} = require('./setting');
const {
    listTransactions
} = require('./transaction');

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
        // body: data,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
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

const parseBody = event =>
{
    try
    {
        log("parsing body:", _.get(event, 'body'));
        return Promise.resolve(JSON.parse(_.get(event, 'body')));
    }
    catch(err)
    {
        return Promise.error(err);
    }
};

const login = body =>
    new Promise((success, failure)=>
    {
        try
        {
            const bodyData = JSON.parse(body);
            const username = _.get(bodyData, 'username');
            const password = _.get(bodyData, 'password');
            listUsers()
            .then(users =>
            {
                log("username:", username);
                log("password:", password);
                log("users:", users);
                const foundUser = _.find(users, user => user.username === username && user.password === password);
                log("foundUser:", foundUser);
                if(_.isUndefined(foundUser))
                {
                    failure(new Error(`No user found for ${username}`));
                }
                else
                {
                    success(sanitizeUser(foundUser));
                }
            })
            .catch(err =>
            {
                failure(new Error("Unknonwn error: " + err));
            });
        }
        catch(err)
        {
            failure(err);
        }
    });

const getDataFromPath = (path, body) =>
{
    switch(path)
    {
        case '/api/user/list': return listUsers();
        case '/api/user/login': return login(body);
        case '/api/account/list': return listAccounts();
        case '/api/setting/list': return listSettings();   
        case '/api/transaction/list': return listTransactions();
        default:
            return Promise.resolve('Unknown path.');
    }
};

const handler = (event, context, callback) =>
{
    log("event:", event);
    // log("context:", context);
    // log("path:", _.get(event, 'path'));

    if(_.isNil(callback) === true)
    {
        return Promise.resolve(getErrorResponse(['No callback was passed to the handler.']));
    }

    if(_.isNil(context) === true)
    {
        return Promise.resolve(getErrorResponse(['No context was passed to the handler.']));
    }
    const path = _.get(event, 'path');
    return getDataFromPath(path, _.get(event, 'body'))
    .then(data =>
    {
        log("in 2nd then");
        const response = getResponse(data);
        callback(undefined, response);
        return Promise.resolve(response);
    })
    .catch(error =>
    {
        log("in error");
        const errorResponse = getErrorResponse([error]);
        callback(undefined, errorResponse);
        return Promise.reject(errorResponse);
    });
};

module.exports = {
    handler
};

