/* eslint-disable no-unused-vars */
const axios = require('axios');

const Query = {
  calculatePrice: async (parent, args, { pubsub, client }) => {
    // convert the args.type enum to lowercase
    args.type = args.type.toLowerCase();
    // Get the percentage
    const margin = args.margin / 100;
    // Get bitcoin-dollar rate and make computations with supplied values
    const { data } = await axios(
      'https://api.coindesk.com/v1/bpi/currentprice.json'
    );

    const dollarRate = data.bpi.USD.rate_float;

    let updatedRate = 0;

    if (args.type === 'buy') {
      updatedRate = dollarRate + dollarRate * margin;
    } else {
      updatedRate = dollarRate - dollarRate * margin;
    }

    const insertText = 'INSERT into conversion(result) VALUES($1) RETURNING * ';

    const result = (updatedRate * args.exchangeRate).toFixed(2);

    const done = await client.query(insertText, [result]);

    /**
     * Final conversion result is the product of the computed rate
     * and the supplied exchange naira-dollar rate
     */
    // Add the records of the conversion to our 'makeshift' database
    // Return output of conversion
    const resultData = {
      id: done.rows[0].id,
      result
    };

    // conversions.push(result);

    // publish the result
    pubsub.publish('calculate-price', { newConversion: resultData });
    return resultData;
  },
  allConversions: async (parent, args, { client }) => {
    const data = await client.query('SELECT * from conversion');
    return data.rows;
  }
};

const Subscription = {
  newConversion: {
    subscribe: (parent, args, { pubsub }) =>
      pubsub.asyncIterator('calculate-price')
  }
};

const resolvers = {
  Query,
  Subscription
};

module.exports = resolvers;
