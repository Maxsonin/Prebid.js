import { expect } from 'chai';
import { spec } from 'modules/leskoBidAdapter.js';

const BANNER_REQUEST = {
  bidId: '123abc',
  params: { leskoid: 12345 },
  sizes: [[300, 250]],
};

const SERVER_BANNER_RESPONSE = {
  body: {
    source: { leskoid: 12345, pubId: 54321 },
    bids: [
      {
        requestId: '123abc',
        cpm: 5,
        width: 300,
        height: 250,
        creativeId: 'creative123',
        ad: '<div>Ad</div>',
      },
    ],
  },
};

describe('leskoBidAdapter', () => {
  describe('isBidRequestValid', () => {
    it('should return true when required params found', () => {
      expect(spec.isBidRequestValid(BANNER_REQUEST)).to.equal(true);
    });

    it('should return false when required params are not passed', () => {
      const bid = { ...BANNER_REQUEST };
      delete bid.params;
      expect(spec.isBidRequestValid(bid)).to.equal(false);
    });
  });

  describe('buildRequests', () => {
    it('creates POST request with correct payload', () => {
      const request = spec.buildRequests([BANNER_REQUEST]);
      const payload = request.data;

      expect(payload.data[0]).to.deep.equal({
        bidId: '123abc',
        leskoid: 12345,
        sizes: [[300, 250]],
      });
    });
  });

  describe('interpretResponse', () => {
    it('returns formatted bid array for valid server response', () => {
      const result = spec.interpretResponse(SERVER_BANNER_RESPONSE);

      expect(result).to.deep.equal([
        {
          requestId: '123abc',
          cpm: 5,
          currency: 'USD',
          width: 300,
          height: 250,
          creativeId: 'creative123',
          ad: '<div>Ad</div>',
          ttl: 300,
          netRevenue: true,
          mediaType: 'banner',
        },
      ]);
    });
  });
});
