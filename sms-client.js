import config from 'config';
import { stat, writeFile } from 'fs/promises';
import Keyv from 'keyv';
import debugFactory from 'debug';
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import smsClientFactory from 'twilio';

const { accountSid, authToken } = config.get('twilio');

const client = smsClientFactory(accountSid, authToken);
const debug = debugFactory('notifier:SmsClient');

dayjs.extend(isSameOrAfter)

export default class SmsClient {
  /**
   * Send a message if one has not already been sent
   * send state is kept on the local filesystem
   */
  static async sendThrottledMessage({ to, body }, options) {
    if (options.dryRun) {
      debug('dry-run mode: skipping send');
      return;
    }

    const keyv = new Keyv(config.get('twilio.cacheDb'));
    const file = `./db/${to}`;
    const info = await stat(file)
      .catch(() => false);

    if (info) {
      debug(`last send time for this address: ${info.mtime}`);

      // file write time (last send) after time threshold
      const reNotifyHours = config.get('reNotifyHours');
      if (dayjs(info.mtime).isSameOrAfter(dayjs().subtract(reNotifyHours, 'hour'))) {
        debug('message already sent; skipping');
        return;
      }
    }

    await this.sendMessage({ to, body }, options);
    await writeFile(file, body);
  }

  /**
   * Send a text message
   */
  static async sendMessage({ to, body }) {
    const from = config.get('twilio.smsFromNo');

    return client.messages.create({ body, from, to });
  }
}
