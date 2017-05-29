"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('../guid');

const _createAccount = (dynamodb, name, amount) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                name: {"S": name},
                amount: {"N": amount.toString()},
                creationDate: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "button_accounts"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("createAccount err:", err);
            log("createAccount data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const _listAccounts = dynamodb =>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "button_accounts"
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
                    name: _.get(item, 'name.S'),
                    amount: parseInt(_.get(item, 'amount.N')),
                    creationDate: new Date(_.get(item, 'creationDate.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

const listAccounts = _.partial(_listAccounts, dynamodb);
const createAccount = _.partial(_createAccount, dynamodb);

module.exports = {
    createAccount,
    listAccounts,
    _listAccounts,
    _createAccount
};

// createAccount(dynamodb, 'cow', 2)
// .then(result => log("result:", result))
// .catch(error => log("error:", error));

// listAccounts(dynamodb)
// .then(result => log("result:", result))
// .catch(error => log("error:", error));


// { ConsumedCapacity: { TableName: 'button_accounts', CapacityUnits: 1 } }
// result: { ConsumedCapacity: { TableName: 'button_accounts', CapacityUnits: 1 } }


// result: [ { id: '68632684-b7ed-16cd-5e7a-fbfdcd7c03d5',
//     name: 'cow',
//     amount: undefined,
//     creationDate: 2017-05-29T12:21:27.000Z } ]