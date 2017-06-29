const expect = require("chai").expect;
const should = require('chai').should();
const chaiAsPromised = require('chai-as-promised');
require('chai').use(chaiAsPromised);
const _ = require('lodash');
const {
    handler
} = require('./index');
const log = console.log;

const responseLike = (o)=> _.isObjectLike(o) && _.has(o, 'statusCode') && _.has(o, 'body');
const promiseLike = o => _.isObjectLike(o) && _.hasIn(o, 'then') && _.hasIn(o, 'catch');
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
        it('returns a promise with basic inputs', ()=>
        {
            const response = handler({}, {}, ()=>{});
            promiseLike(response).should.be.true;
        });
        it('returns a response with basic inputs', done =>
        {
            handler({}, {}, ()=>{})
            .then(result =>
            {
                responseLike(result).should.be.true;
                done();
            })
            .catch(done);
        });
        it('passing nothing is ok', done =>
        {
            handler()
            .then(result =>
            {
                responseLike(result).should.be.true;
                done();
            })
            .catch(done);
        });
        it('succeeds if event only has echo to true', done =>
        {
            handler({echo: true}, {}, ()=>{})
            .then(result =>
            {
                responseSucceeded(result).should.be.true;
                done();
            })
            .catch(done);
        });
    });
});