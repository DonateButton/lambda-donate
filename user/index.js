"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('../guid');

const _createUser = (dynamodb, firstName, lastName, username, password, avatarURL) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                firstName: {"S": firstName},
                lastName: {"S": lastName},
                username: {"S": username},
                password: {"S": password},
                avatarURL: {"S": avatarURL},
                creationDate: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "button_users"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("createUser err:", err);
            log("createUser data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const _listUsers = dynamodb =>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "button_users"
        };
        dynamodb.scan(params, (err, data)=>
        {
            if(err)
            {
                return failure(err);
            }
            const items = _.chain(data)
            .get('Items')
            .map(item =>
            {
                return {
                    id: _.get(item, 'id.S'),
                    firstName: _.get(item, 'firstName.S'),
                    lastName: _.get(item, 'lastName.S'),
                    username: _.get(item, 'username.S'),
                    avatarURL: _.get(item, 'avatarURL.S'),
                    password: _.get(item, 'password.S'),
                    creationDate: new Date(_.get(item, 'creationDate.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

const sanitizeUser = user =>
{
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatarURL: user.avatarURL
    };
};

const createUser = _.partial(_createUser, dynamodb);
const listUsers = _.partial(_listUsers, dynamodb);
module.exports = {
    createUser,
    listUsers,
    _createUser,
    _listUsers,
    sanitizeUser
};

// createUser('Jesse', 'Cow', 'jesterxl', 'password', '')
// .then(result => log("result:", result))
// .catch(error => log("error:", error));

// listUsers()
// .then(result => log("result:", result))
// .catch(error => log("error:", error));