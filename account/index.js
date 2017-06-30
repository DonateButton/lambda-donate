"use strict";
const _ = require('lodash');
const log = console.log;
const AWS      = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
const guid = require('../guid');
const Validation = require('folktale/validation');
const { Success, Failure } = Validation;
const Result = require('folktale/result');
const validationToResult = require('folktale/conversions/validation-to-result');

const validString = o => _.isString(o) && o.length > 0;
const validNumber = o => _.isNumber(o) && _.isNaN(o) === false;
const validDate = o => _.isDate(o) && o.toString() !== 'Invalid Date';

const isSavingsString = o => _.isString(o) && o.toLowerCase() === 'savings';
const isCheckingString = o => _.isString(o) && o.toLowerCase() === 'checking';
const isCheckingOrSavingsString = o => isSavingsString(o) || isCheckingString(o);

const validName = name =>
    validString(name) ? Success(name)
    : /* otherwise */   Failure(['Name must be a string and not blank.']);

const validAmount = amount =>
    validNumber(amount) ? Success(amount)
    : /* otherwise */ Failure(['Amount must be a number and not NaN.']);

const validType = type =>
  isCheckingOrSavingsString(type) ? Success(type)
: /* otherwise */                   Failure(['Type must be savings or checking, all lowercase.']);

const validCreationDate = date =>
    validDate(date) ? Success(date)
    : /* otherwise */   Failure(['Creation date must be a valid date.']);

const getDynamoPutArgsValid = (name, amount, type, date) =>
    Success().concat(validName(name))
             .concat(validAmount(amount))
             .concat(validType(type))
             .concat(validCreationDate(date));

const getDynamoPut = (name, amount, type, date) =>
    getDynamoPutArgsValid(name, amount, type, date)
    .map(_ => ({
            Item: {
                id: {"S": guid()},
                name: {"S": name},
                amount: {"N": amount.toString()},
                type: {"S": type},
                creationDate: {"S": date.toString()}
            },
            ReturnConsumedCapacity: "TOTAL", 
            TableName: "button_accounts"
        })
    )
    .mapFailure(validationToResult);

const _createAccount = (dynamodb, name, amount, type) =>
{
    return new Promise((success, failure)=>
    {
        const date = new Date();
         const params = {
            Item: {
                id: {"S": guid()},
                name: {"S": name},
                amount: {"N": amount.toString()},
                type: {"S": type},
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
                    type: _.get(item, 'type.S'),
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
    _createAccount,
    getDynamoPutArgsValid,
    getDynamoPut
};
// createAccount('Capital One 360 Checking', 524.13, 'checking')
// .then(result => log("result:", result))
// .catch(error => log("error:", error));

// createAccount('Capital One 360 Savings', 2145.04, 'savings')
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