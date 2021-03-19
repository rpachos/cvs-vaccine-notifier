import { assert } from 'chai';
import sinon from 'sinon';
import nock from 'nock'

import { distanceMatrixResponse } from '../fixtures/google';
import { getLocationDataResponse } from '../fixtures/cvs';

describe('Integration: E2E Flow', () => {
  let sandbox;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {

  });

  afterEach(async () => {

  });

  context('XX', () => {
    it('WIP', async () => {
      console.log('xx')
    });
  });
});
