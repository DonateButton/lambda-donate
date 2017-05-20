"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('./guid');

const putOrganization = name =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                name: {"S": name},
                date: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "donate_organizations"
        };
        dynamodb.putItem(params, (err, data)=>
        {
            log("putOrganization err:", err);
            log("putOrganization data:", data);
            if(err)
            {
                return failure(err);
            }
            return success(data);
        });
    }); 
};

const listOrganizations = ()=>
{
    return new Promise((success, failure)=>
    {
        var params = {
            Limit: 25,
            Select: 'ALL_ATTRIBUTES',
            TableName: "donate_organizations"
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
                    date: new Date(_.get(item, 'date.S'))
                };
            })
            .value();
            return success(items);
        });
    }); 
};

module.exports = {
    putOrganization,
    listOrganizations
};