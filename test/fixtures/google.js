export const distanceMatrixResponse = (origin, destination, miles) => ({
  'destination_addresses': [
    'New York, NY, USA'
  ],
  'origin_addresses': [
    'Washington, DC, USA'
  ],
  'rows': [
    {
      'elements': [
        {
          'distance':{
            'text': '225 mi',
            'value': 361952
          },
          'duration':{
            'text': '3 hours 45 mins',
            'value': 13487
          },
          'status': 'OK'
        }
      ]
    }
  ],
  'status': 'OK'
});
