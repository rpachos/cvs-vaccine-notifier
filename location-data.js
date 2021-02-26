import config from 'config';
import fetch from 'node-fetch';
import Keyv from 'keyv';
import Promise from 'bluebird';
import debugFactory from 'debug';
import { Client } from "@googlemaps/google-maps-services-js";

fetch.Promise = Promise;
const debug = debugFactory('notifier:LocationData');

export default class LocationData {
  /**
   * Returns a distance in miles for two locations
   */
  static async getDistance(origin, destination) {
    const client = new Client({});
    const keyv = new Keyv(config.get('google.cacheDb'));

    let distance= await keyv.get(`${origin}:${destination}`);

    if (distance) {
      debug(`found distance in cache; returning ${distance}`);
      return distance;
    }

    distance = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        units: 'imperial',
        key: config.get('google.key'),
      },
    })
      .then((res) => {
        const meters = res.data.rows[0].elements[0].distance.value;
        return Math.ceil(meters / 1609);
      });

    await keyv.set(`${origin}:${destination}`, distance);

    return distance;
  }

  /**
   * Download availability data for specified states
   * @param {array<string>} states- requested states
   * @returns {Object} object of location data keyed by state
   */
  static download (states) {
    return Promise.props(
      Object.fromEntries(
        states.map((state) => [state, this.getStateLocationData(state)])
      )
    );
  }

  /**
   * Download availability data for a specified state
   * @param {string} state - requested state
   * @returns {array<Object>} list of locations with availability data
   */
  static getStateLocationData(state) {
    state = state.toUpperCase();

    return fetch(`https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${state}.json?vaccineinfo`, {
      headers: config.get('cvs.headers'),
      method: "GET",
      mode: "cors"
    })
    .then(async (res) => {
      if (!res.ok) {
        return Promise.reject(res);
      }

      const json = await res.json();
      return json.responsePayloadData.data[state];
    })
  }
}
