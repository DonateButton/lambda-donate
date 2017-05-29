const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const _ = require('lodash');
const {
    createAccount,
    listAccounts
} = require('./index');

const responseLike = (o)=> _.isObjectLike(o) && _.has(o, 'statusCode') && _.has(o, 'body');
const responseSucceeded = (o)=>
{
    try
    {
        const body = JSON.parse(o.body);
        return body.result === true;
    }
    catch(err)
    {
        return false;
    }
};

describe('#index', ()=>
{
    describe('#createAccount', ()=>
    {
        const mockDynamo = {
            putItem: (params, callback)=> callback(undefined, {})
        };
        it('returns a response with basic inputs', ()=>
        {
            return createAccount(mockDynamo, 'test', 2).should.be.fulfilled;
        });
        it('fails with bad inputs', ()=>
        {
            return createAccount(mockDynamo).should.be.rejected;
        });
    });
});