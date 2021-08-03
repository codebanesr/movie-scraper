const mongoose = require('mongoose');

const {config} = require("dotenv");
config({ path: '.env' })
const { getMoviesBySiteId } = require('./getMoviesbySiteId');
const { MovieModel } = require('./models/movie.model');
const { SiteModel } = require('./models/sites.model');
const axios = require('axios');
const { transformRawData } = require('./transformRawData');
const { saveMoviesToFiles } = require('./saveMoviesToFiles');
const { FormattedMovieModel } = require('./models/formatted-movie.model');
const moment = require("moment");
const connectToDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to mongodb");
}


const sleep = async (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, ms);
  })
}

const cleanupOnStart = async () => {
  try {
    await SiteModel.collection.drop();
    await MovieModel.collection.drop();
    await FormattedMovieModel.drop();
  } catch (e) {
    console.log("Cannot drop both models, will continue");
  }
}


const fetchAllSites = async () => {
  await connectToDb();
  await cleanupOnStart();
  const result = await axios("https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/sites", {
    "headers": {
      "authorization": `Bearer ${process.env.JWT_TOKEN}`,
    }
  });

  const transformedSites = result.data.sites.map(s => {
    return { ...s, _id: s.id }
  });

  await SiteModel.insertMany(transformedSites);
  const days = [moment().format('yyyy-MM-DD'), moment().add(1, "days").format("yyyy-MM-DD"), moment().add(2, "days").format("yyyy-MM-DD")]
  for (let day of days) {
    for (let site of transformedSites) {
      console.log("siteid", site.id)
      try {
        const res = await getMoviesBySiteId(site._id, day);
        await MovieModel.create(res);
      } catch (e) {
        console.log({ error: e.message, message: "Will try again in 60 seconds", data: site })
        setTimeout(() => {
          getMoviesBySiteId(site.id).then(async result => {
            await MovieModel.create(result);
          }).catch(e => {
            console.log("Api timeout for a second time for", site)
          });
        }, 60000);
      }
    }
  }

  console.log("Waiting 80 seconds for all apis to complete");
  await sleep(80000);
  await transformRawData();
  await saveMoviesToFiles();
}


fetchAllSites().then(data => {
  console.log("Fetched all")
}).catch(e => {
  console.log(e.message)
})