export default class SearchJobs {
  /**
   * Retrieve configured serach jobs
   * TODO: move to simple DB table
   * @return {array<Object>}
   */
  static get() {
    const disabled = true;

    return [
      // examples with dummy numbers; currently disabled
      { name: 'Adrian', city: 'Derwood',  state: 'MD', maxDistance: 90, notify: ['+19085551234', '+19085559876'], disabled },
      { name: 'Mike',   city: 'Fort Lee', state: 'NJ', maxDistance: 16, notify: ['+17325551234'], disabled },
      { name: 'Carrie', city: 'Fort Lee', state: 'NJ', maxDistance: 25, notify: ['+19085551234'], disabled },
      { name: 'Linda',  city: 'Phoenix',  state: 'AZ', maxDistance: 45, notify: ['+16025551234'], disabled },
      { name: 'Dad',    city: 'Brunswick',  state: 'NJ', maxDistance: 20, notify: ['+17325551234'], disabled },
      { name: 'Laci',   city: 'Brooklyn', state: 'NY', maxDistance: 50, notify: ['+14058870661'] },
      { name: 'Rob',    city: 'Brooklyn', state: 'NY', maxDistance: 50, notify: ['+17329917793'] },
    ];
  }
}
