"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('../guid');

const createUser = (dynamodb, firstName, lastName, avatarURL) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                firstName: {"S": firstName},
                lastName: {"S": lastName},
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

const listUsers = dynamodb =>
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
                    creationDate: new Date(_.get(item, 'creationDate.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

module.exports = {
    createUser,
    listUsers
};

// createUser(dynamodb, 'Jesse', 'Cow', '')
// .then(result => log("result:", result))
// .catch(error => log("error:", error));

// listUsers(dynamodb)
// .then(result => log("result:", result))
// .catch(error => log("error:", error));