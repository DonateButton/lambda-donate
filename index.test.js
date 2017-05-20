const expect = require("chai").expect;
const should = require('chai').should();
const _ = require('lodash');
const {
    handler
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
    describe('#handler', ()=>
    {
        it('returns a response with basic inputs', ()=>
        {
            const response = handler({}, {}, ()=>{});
            responseLike(response).should.be.true;
        });
        it('passing nothing is ok', ()=>
        {
            const response = handler();
            responseLike(response).should.be.true;
        });
        it('succeeds if event only has echo to true', ()=>
        {
            const response = handler({echo: true}, {}, ()=>{});
            responseSucceeded(response).should.be.true;
        });
    });
});