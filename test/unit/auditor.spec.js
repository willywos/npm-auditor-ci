
import {expect} from 'chai';
import {testJSON, noAdvisoriesJSON, findingAdvisoryJSON} from './test-json';
import _ from 'lodash';

import Auditor from '../../src/auditor';

describe('Auditor', () => {
  let auditor;

  describe(".buildCmdLine()", () => {

    it('should include a registry option', () => {
      auditor = new Auditor(null, { registry: 'https://npmjs.org/registry', json: false});
      expect(auditor.buildCmdLine()).to.eql("npm audit --json --registry='https://npmjs.org/registry'")
    });
  });

  describe(".mapSeverities()", () => {
    it('should map the advisories to the serverity level and ignore any findings that are for development', () => {
      auditor = new Auditor(null, { ignoreDev: true, registry: 'https://npmjs.org/registry', json: false});
      let jsonData = JSON.parse(findingAdvisoryJSON);
      let severities = auditor.mapSeverities(jsonData)
      expect(_.find(severities, { level:'low'}).advisories).to.eql([])
      expect(_.find(severities, { level:'moderate'}).advisories).to.eql([])
      expect(_.find(severities, { level:'high'}).advisories).to.eql([])
      expect(_.find(severities, { level:'critical'}).advisories).to.eql([])
    });

    it('should map the advisories to the serverity level and NOT ignore any findings', () => {
      auditor = new Auditor(null, { registry: 'https://npmjs.org/registry', json: false});
      let jsonData = JSON.parse(findingAdvisoryJSON);
      let severities = auditor.mapSeverities(jsonData)
      expect(_.find(severities, { level:'low'}).advisories).to.eql([])
      expect(_.find(severities, { level:'moderate'}).advisories).to.eql([])
      expect(_.find(severities, { level:'high'}).advisories.length).to.eql(1)
      expect(_.find(severities, { level:'critical'}).advisories).to.eql([])
    });
  });

  describe(".processJSON()", () => {
    it("should return 1 when there are any advisories", () => {
      auditor = new Auditor(null, { threshold: 'high', registry: 'https://npmjs.org/registry', json: false});
      let jsonData = JSON.parse(testJSON);
      expect(auditor.processJSON(jsonData).code).to.equal(1)
    });

    it("should return 1 when there are advisories", () => {
      auditor = new Auditor(null, { registry: 'https://npmjs.org/registry', json: false});
      let jsonData = JSON.parse(noAdvisoriesJSON);
      expect(auditor.processJSON(jsonData).code).to.equal(0)
    });
  });

  describe("#formatExitDataForAdvisory()", () => {
    it("should display the results into a table", () => {
      auditor = new Auditor(null, { threshold: 'high', registry: 'https://npmjs.org/registry', json: false});
      let jsonData = JSON.parse(testJSON);
      let data = auditor.processJSON(jsonData).data;
      let firstRow = Auditor.formatExitDataForAdvisory(data)[0]
      expect(firstRow).to.eql({
        name: 'superagent',
        severity: 'low',
        title: 'Large gzip Denial of Service',
        url: 'https://npmjs.com/advisories/479',
        version: '1.8.5'
      })
    });
  });
});