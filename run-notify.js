import config from 'config';
import Promise from 'bluebird';
import debugFactory from 'debug';
import commander from 'commander';
import smsClient from './sms-client';
import SearchJobs from './search-jobs';
import LocationData from './location-data';

const debug = debugFactory('notifier:processSearchJob');
const [anyStatus, anyTown, dryRun] = [true, false, true];
commander
  .option('-s, --any-status', 'Skip filter of locations by vaccine status')
  .option('-a, --any-distance', 'Skip filter by distance')
  .option('-d, --dry-run', 'Skip sending any emails')
  .parse();

const options = commander.opts();

run(options);

/**
 * Execute vaccine search for configured search jobs
 */
async function run(options) {
  debug('running with options', options);
  process.stdout.write(new Date().toString()+"\n");

  const searchJobs = SearchJobs.get();
  let states = Array.from(new Set(searchJobs.map(({ state }) => state)));
  const locationData = await LocationData.download(states);
  await Promise.map(searchJobs, (job) => processSearchJob(job, locationData, options), { concurrency: 1 });

  process.stdout.write('processing complete\n');
}

/**
 * Iterate over location data applying the current search critera
 * and send a text notification to the job list if any entries are found
 */
async function processSearchJob(jobDesc, locationData, options) {
  let locationCount = 0;
  let availableCities = [];
  const { anyStatus, anyDistance } = options;

  debug(jobDesc, options);
  const { name, notify, state: userState, city: userCity, maxDistance, disabled } = jobDesc;
  if (disabled) {
    return;
  }

  // loop over provided json data files
  await Promise.map(Object.entries(locationData), async ([state, locations]) => {
    // no vaccines across states for now
    locations = locations
      .filter(({ state }) => state === userState);

    // track total potential locations (exclude other states)
    locationCount += locations.length;

    // remove booked locations
    locations = locations
      .filter(({ status }) => status !== 'Fully Booked' || anyStatus);

    // filter locations based on maxDistance; skip if missing or anyDistance option enabled
    if (anyDistance || maxDistance) {
      locations = await Promise.map(
        locations,
        async (location) => {
          const { city } = location;
          const [from, to] = [`${city},${state}`, `${userCity},${userState}`]
          const miles = await LocationData.getDistance(from, to);
          return { ...location, miles };
        },
      );

      locations = locations 
        .filter(({ miles }) => miles <= maxDistance || anyDistance)
    }

    debug({ state, locations });
    availableCities.push(...locations.map(({ city }) => city));
  });
  
  // bail if there's no appointments available
  debug({ availableCities });
  if (!availableCities.length) {
    console.log(`No appointments of the ${locationCount} locations for ${name}`);
    return;
  }

  // notify contact numbers when locations are available
  await Promise.map(notify, (to) => {
    const body = `CVS Vaccine Available: ${availableCities.join(', ')}`;
    debug({ to, body });

    return smsClient.sendThrottledMessage({ to, body }, options);
  });
}
