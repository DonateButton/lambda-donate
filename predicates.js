const _ = require('lodash');
const log = console.log;

const validator = (errorCode, method)=>
{
	const valid = (...args) => method.apply(method, args);
	valid.errorCode = errorCode;
	return valid;
}

const checker = (...validators)=>
{
	return (something)=>
	{
		return _.reduce(validators, (errors, validatorFunction)=>
		{
			if(validatorFunction(something))
			{
				return errors;
			}
			else
			{
				return _.chain(errors).push(validatorFunction.errorCode).value();
			}
		}, [])
	};
};

const checkParameters = (valueAndCheckerArray)=>
{
    return _.reduce(valueAndCheckerArray, (accumlator, item, index, collection)=>
    {
        const value = _.first(item);
        const checker = _.last(item);
        const errors = checker(value);
        return [...accumlator, ...errors];
    }, []);
};

module.exports = {
	validator,
	checker,
	checkParameters
};