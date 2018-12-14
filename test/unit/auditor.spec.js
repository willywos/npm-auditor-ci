
import {expect} from 'chai';
import {testJSON, noAdvisoriesJSON, findingAdvisoryJSON} from './test-json';
import _ from 'lodash';

import Auditor from '../../src/auditor';

describe('Auditor', () => {
  let auditor;

  describe(".buildCmdLine()", () => {

    it('should include a registry option and json', () => {
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
        name: 'growl',
        action: 'gulp-mocha, mocha',
        severity: 'critical',
        title: 'Command Injection',
        url: 'https://npmjs.com/advisories/146',
        version: '1.9.2'
      })
    });
  });

  describe(".filterAndCombineByThreshold()", () => {

    let jsonData = "";
    let auditedData = "";

    beforeEach(() => {
      auditor     = new Auditor(null, { threshold: 'low', registry: 'https://npmjs.org/registry', json: false});
      jsonData    = JSON.parse(testJSON);
      auditedData = auditor.mapSeverities(jsonData);
    });


    it("should filter based on the threshold", () => {
      let data = auditor.filterAndCombineByThreshold(auditedData, 'critical');
      expect(data.length).to.eql(1)
    });

    it("should filter based on the threshold and return higher items", () => {
      let data = auditor.filterAndCombineByThreshold(auditedData, 'moderate');
      expect(data.length).to.eql(4)
    });

    it("should include all items when severity is low", () => {
      let data = auditor.filterAndCombineByThreshold(auditedData, 'low');
      expect(data.length).to.eql(7)
    });

    it("should not include any items when there is no severity", () => {
      let data = auditor.filterAndCombineByThreshold(auditedData, '');
      expect(data.length).to.eql(0)
    });
  });

  describe('.findActionForModuleName()', () => {
    let jsonData = "";
    let auditedData = "";

    beforeEach(() => {
      auditor     = new Auditor(null, { threshold: 'low', registry: 'https://npmjs.org/registry', json: false});
      jsonData    = JSON.parse(testJSON);
      auditedData = auditor.mapSeverities(jsonData);
    });

    it("should find package information", () => {

      let dataPaths = JSON.parse(`{
        "paths": [
          "gulp>vinyl-fs>glob-watcher>gaze>globule>glob>minimatch",
          "gulp>vinyl-fs>glob-watcher>gaze>globule>minimatch"
        ]
      }`);

      let data = Auditor.findActionForModuleName(dataPaths.paths, jsonData)
      expect(data).to.eql("install gulp 4.0.0")
    });
  });
});
