const { FormattedMovieModel } = require('./models/formatted-movie.model')
const { MovieModel } = require('./models/movie.model')

const transformRawData = async() => {
  const result = await MovieModel.aggregate([
    { $unwind: "$relatedData.sites" },
    { $unwind: "$relatedData.films" },
    { $unwind: "$showtimes" },
    {
      $project: {
        _id: 0,

        cinema_name: "$relatedData.sites.name.text",
        // cinema_key: "$relatedData.",
        showtimeId: "$showtimes.id",
        film_id: "$relatedData.films.id",
        cinema_id: "$relatedData.sites.id",
        film_name: "$relatedData.films.title.text",
        date: "$businessDate",
        time: "$showtimes.schedule.startsAt",
        is3d: "$showtimes.requires3dGlasses",
        //redirect_url: "$",
      },
    }
  ]);


  await FormattedMovieModel.insertMany(result);
}

exports.transformRawData = transformRawData;