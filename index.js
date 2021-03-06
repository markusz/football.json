'use strict';

const commander = require('commander');
const logger = require('winston');

const CSVBuilder = require('./src/csv-builder');
const IO = require('./src/io');
logger.cli();

function getYear(year) {
  return parseInt(year, 10);
}

// Errors:
// de_1_14 -> Round 30,
// es_1_14 -> Round 22
// en_1_13 -> Round 25
// it_1_14 -> Round 11
// node src/weka-export.js -f 2015-10-29 -s 2015-11-16 -c 2015-05-04 -V
commander
  .option('-y, --year [n]', 'The year of the season start', getYear, 15)
  .option('-c, --countrycode [s]', 'The country code', 'de')
  .option('-l, --league [s]', 'The league', '1')
  .option('-L, --local [b]', 'Use local data', false)
  .option('-C, --complete [b]', 'Also adds yet unplayed matches to the CSV. [default=false]', false)
  .option('-V, --verbose [b]', 'Also adds verbose data like team code that makes reading data easier for humans. [default=false]', false)
  .option('-T, --tables [b]', 'Print tables. [default=false]', false)
  .parse(process.argv);

const behaviourConf = {
  verbose: commander.verbose,
  complete: commander.complete,
  tables: commander.tables
};

const ioConf = {
  league: commander.league,
  country: commander.countrycode,
  year: commander.year
};

logger.info('Behaviour Config is', behaviourConf);
logger.info('IO Config is', ioConf);

const io = new IO(ioConf);
io.loadData(commander.local, function() {
  const csvBuilder = new CSVBuilder(io.rounds, io.clubCodes, behaviourConf);

  try {
    const data = csvBuilder.makeDataForCSVExport();
    io.writeToDiskAsCSV(data);
  } catch (e) {
    logger.error(e.message);
  } finally {
    process.exit(0);
  }
});
