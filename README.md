# cvs-vaccine-notifier
Polls CVS website for vaccine availability and notifies via text message

# Installation

Requires node12 installed on your machine.

```
npm install
```

# Setup

This project relies on the following external service dependencies:
* **Google Distance Matrix API**: to compute CVS vaccine locations within desired distance
* **Twilio API**: for SMS notifications

In order to get up and running you'll need to do the following:
1. Configure Twilio (trial) account
    1. Create account
    1. Add API credentials to config/default.js
    1. Provision a sending phone number and add to `config/default.js`
    1. Whitelist the numbers you want to notify for searches
2. Configure Google API account
    1. Create account
    1. Add credentials to `config/default.js`
    1. *(you can skip this if you run with `--any-distance` option and you'll be notified for all available locations in your state)*
3. Add searches for which you want notifications to `search-jobs.js` using the existing examples as a guide


# Running

```
npm run start -- [--dry-run] [--any-distance] [--any-status]

```

To set the project up for automation, configure it under something like cron so it periodically checks, e.g. to run every 10 minutes from my home directory:

```
crontab -l

PATH=$PATH:/Users/rpachos/.nvm/versions/node/v14.15.5/bin
NODE_ENV=production
*/10 * * * * cd ~/cvs-vaccine-notifier/ && node -r esm run-notify.js >> ./vaccine.log
```

## Options

* **--dry-run**: run without sending any notifications
* **--any-distance**: skip distance checks for your location vs CVS location (all locations in your state)
* **--any-status**: skip vaccine availability status check; for debugging only

## Debugging

To see verbose debugging output about the work being done set environment variable before running:

```
DEBUG=notifier* <command above>
```
