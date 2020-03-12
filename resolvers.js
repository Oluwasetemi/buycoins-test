const axios = require('axios');

const conversions = [{ id: 1, result: 340000 }];

const Query = {
  calculatePrice: async (parent, args) => {
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
    } else if (args.type === 'sell') {
      updatedRate = dollarRate - dollarRate * margin;
    } else {
      const defaultConversionResult = {
        id: 0,
        result: null
      };
      conversions.push(defaultConversionResult);

      return defaultConversionResult;
    }

    /**
     * Final conversion result is the product of the computed rate
     * and the supplied exchange naira-dollar rate
     */
    const result = {
      id: conversions.length + 1,
      result: (updatedRate * args.exchangeRate).toFixed(2)
    };

    // Add the records of the conversion to our 'makeshift' database
    conversions.push(result);
    // Return output of conversion
    return result;
  },
  allConversions: (parent, args) => conversions
};

const resolvers = {
  Query
};

module.exports = resolvers;
