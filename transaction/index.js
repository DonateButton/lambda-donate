"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('../guid');

const createTransaction = (dynamodb, organizationID, amount) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                organizationID: {"S": organizationID},
                amount: {"S": amount.toString()},
                creationDate: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "button_transactions"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("createTransaction err:", err);
            log("createTransaction data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const listTransactions = ()=>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "button_transactions"
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
                    organizationID: _.get(item, 'organizationID.S'),
                    amount: _.get(item, 'amount.S'),
                    creationDate: new Date(_.get(item, 'creationDate.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

module.exports = {
    createTransaction,
    listTransactions
};

// createTransaction(dynamodb, '123', 2)
// .then(result => log("result:", result))
// .catch(error => log("error:", error));

// listTransactions(dynamodb)
// .then(result => log("result:", result))
// .catch(error => log("error:", error));