const { FormattedMovieModel } = require('./models/formatted-movie.model');
const {get: lodashGet} = require('lodash');
const path = require('path');
const fs = require('fs')


const createDirectory = (filepath) => {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath, {
      recursive: true,
    });
  }
}

const saveMoviesToFiles = async () => {
  const results = await FormattedMovieModel.aggregate([
    // {
    //   $addFields: {
    //     date: {
    //       $dateToString: {
    //         format: "%G-%m-%d",
    //         date: "$date",
    //       },
    //     },
    //     time: {
    //       $dateToString: {
    //         format: "%H:%M",
    //         date: "$time",
    //       },
    //     },
    //   },
    // },

    {
      $group: {
        _id: { film_id: "$film_id", cinema_id: "$cinema_id" },
        file: { $push: "$$ROOT" },
      },
    },
    {
      $group: {
        _id: { film_id: "$_id.film_id" },
        dirs: { $push: "$$ROOT" },
      },
    },
  ]).exec();

  results.forEach((record) => {
    const filmDirs = record.dirs;
    const filmname = lodashGet(
      record,
      "dirs[0].file[0].film_name",
      new Date().getTime()
    );

    const filepath = path.join(
      __dirname,
      "data",
      "movies",
      filmname.replace(/[^a-zA-Z]/g, "-")
    );

    console.log(filepath);

    createDirectory(filepath);

    filmDirs.forEach((dir) => {
      // console.log(file);
      fs.writeFileSync(
        path.join(filepath, dir.file[0].cinema_name + ".json"),
        JSON.stringify(dir)
      );
      // stringify dir.file instead of dir
    });
  });
};

exports.saveMoviesToFiles = saveMoviesToFiles;