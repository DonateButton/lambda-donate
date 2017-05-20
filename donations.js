"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('./guid');

const putDonation = amount =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                amount: {"S": amount.toString()},
                date: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "donations"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("putDonation err:", err);
            log("putDonation data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const listDonations = ()=>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "donations"
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
                    amount: parseInt(_.get(item, 'amount.S')),
                    date: new Date(_.get(item, 'date.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

module.exports = {
    putDonation,
    listDonations
};