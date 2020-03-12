const axios = require('axios');

const a = require('../index');

console.log(a);

// afterAll(async () => {
//   await new Promise(resolve => setTimeout(() => resolve(), 5000)); // avoid jest open handle error
// });

afterAll(done => {
  setImmediate(done);
});

describe('Test the GraphQL Service- Query(allConversion and CalculatePrice', () => {
  test('should (initially) return pre-filled conversion result', async () => {
    const { data } = await axios.post('http://localhost:4000/graphql', {
      query: `{
				allConversions{
					id
					result
				}
			}`
    });

    expect(data.data).toHaveProperty('allConversions');
    expect(data.data.allConversions.length).toBe(1);
    expect(data.data.allConversions[0].id).toBe('1');
    expect(data.data.allConversions[0].result).toBe(340000);
  });

  test('should buy', async () => {
    const { data } = await axios.post('http://localhost:4000/graphql', {
      query: `{
				calculatePrice(type: BUY, margin: 0.2, exchangeRate: 360){
					id
					result
				}
			}`
    });

    expect(data.data).toHaveProperty('calculatePrice');
    expect(data.data.calculatePrice.id).toBe('2');
    expect(data.data.calculatePrice).toHaveProperty('result');
  });

  test('should sell', async () => {
    const { data } = await axios.post('http://localhost:4000/graphql', {
      query: `{
				calculatePrice(type: SELL, margin: 0.2, exchangeRate: 360){
					id
					result
				}
			}`
    });

    expect(data.data).toHaveProperty('calculatePrice');
    expect(data.data.calculatePrice.id).toBe('3');
    expect(data.data.calculatePrice).toHaveProperty('result');
  });
});
