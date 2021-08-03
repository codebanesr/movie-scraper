const axios = require("axios")
// change business date to get it for future dates, currently only taking it for one day
const getMoviesBySiteId = async (siteId, date="2021-08-03") => {
  const result = await axios(`https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/showtimes/business-date/${date}?siteIds=${siteId}`, {
    "headers": {
      "authorization": `Bearer ${process.env.JWT_TOKEN}`,
    },
  });
  return result.data;
}
exports.getMoviesBySiteId = getMoviesBySiteId;