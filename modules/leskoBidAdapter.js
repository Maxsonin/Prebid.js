import { registerBidder } from "../src/adapters/bidderFactory.js";
import { BANNER } from "../src/mediaTypes.js";
import { deepAccess, isArray } from "../src/utils.js";

/**
 * @typedef {import('../src/adapters/bidderFactory.js').Bid} Bid
 * @typedef {import('../src/adapters/bidderFactory.js').BidRequest} BidRequest
 * @typedef {import('../src/adapters/bidderFactory.js').ServerResponse} ServerResponse
 * @typedef {import('../src/adapters/bidderFactory.js').ServerRequest} ServerRequest
 */

const AUCTION_PATH = "https://intern-project-server-production.up.railway.app/leskoAuction";
const BIDDER_CODE = "lesko";

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER],

  /**
   * Determines whether or not the given bid request is valid.
   *
   * @param {BidRequest} bid The bid params to validate.
   * @return {boolean} True if this is a valid bid, and false otherwise.
   */
  isBidRequestValid: function(bid) {
    return !!deepAccess(bid, 'params.leskoid');
  },

  /**
   * Make a server request from the list of BidRequests.
   *
   * @param {BidRequest[]} validBidRequests - an array of bids
   * @return {ServerRequest} Info describing the request to the server.
   */
  buildRequests: function(validBidRequests) {
    const payload = {
      data: validBidRequests.map(bid => ({
        bidId: bid.bidId,
        leskoid: bid.params.leskoid,
        sizes: bid.sizes
      }))
    };

    return {
      method: 'POST',
      url: AUCTION_PATH,
      data: payload,
      options: {
        contentType: 'application/json'
      }
    };
  },

  /**
   * Unpack the response from the server into a list of bids.
   *
   * @param {ServerResponse} serverResponse A successful response from the server.
   * @return {Bid[]} An array of bids which were nested inside the server.
   */
  interpretResponse: function(serverResponse) {
    if (!serverResponse || !isArray(serverResponse.body?.bids)) {
      return [];
    }

    return serverResponse.body.bids
      .filter(bid => bid && bid.requestId && bid.cpm)
      .map(bid => ({
        requestId: bid.requestId,
        cpm: bid.cpm,
        currency: bid.currency || 'USD',
        width: bid.width,
        height: bid.height,
        creativeId: bid.creativeId,
        ad: bid.ad,
        ttl: bid.ttl || 300,
        netRevenue: true,
        mediaType: BANNER
      }));
  }
}

registerBidder(spec);
