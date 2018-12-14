import * as child from 'child_process';
import _ from 'lodash';
import cTable from 'console.table';

class Auditor {
  opts = {};

  severities = ['critical', 'high', 'moderate', 'low'];

  constructor(arg, options) {
    this.opts = options;
  }

  buildCmdLine() {
    return `npm audit --json --registry='${this.opts.registry}'`;
  }

  static exitWithCode(exitCode) {
    process.exit(exitCode);
  }

  mapSeverities(data) {
    return this.severities.map(level => {
      let advisoryData = _.filter(data.advisories, { severity: level });
      if (this.opts.ignoreDev) {
        advisoryData = _.reject(advisoryData, item => {
          return _.filter(item.findings, { dev: false }).length <= 0;
        });
      }
      return {
        level,
        advisories: advisoryData
      };
    });
  }

  filterAndCombineByThreshold(data, threshold) {
    let severityIndex = this.severities.indexOf(threshold) + 1;
    let combinedAdvisories = [];
    _.times(severityIndex, index => {
      combinedAdvisories = combinedAdvisories.concat(data[index].advisories);
    });
    return combinedAdvisories;
  }

  processJSON(data) {
    data = this.mapSeverities(data);
    data = this.filterAndCombineByThreshold(data, this.opts.threshold);
    if (data.length > 0) {
      return { code: 1, data };
    }
    return { code: 0, data: [] };
  }

  static findActionForModuleName(modulePaths, data) {
    let paths = [];
    paths = modulePaths.map(item => {
      let rootPathName = item.split('>')[0];
      let actionItem = _.find(data.actions, { module: rootPathName });
      if (actionItem !== undefined) {
        return actionItem.action + ' ' + rootPathName + ' ' + actionItem.target;
      }
      return rootPathName;
    });
    return _.uniq(paths).join(', ');
  }

  static formatExitDataForAdvisory(data) {
    const tableData = data.map(item => {
      return {
        name: item.module_name,
        action: Auditor.findActionForModuleName(item.findings[0].paths, data),
        version: item.findings[0].version,
        severity: item.severity,
        title: item.title,
        url: item.url
      };
    });
    return tableData;
  }

  run() {
    child.exec(this.buildCmdLine(), (err, stdout, stderr) => {
      let data = '';
      try {
        data = JSON.parse(stdout);
      } catch (ex) {
        console.log('npm-auditor-ci encountered an unexpected error.');
        console.log('error:', err);
        console.log('stderr:', stderr);
        Auditor.exitWithCode(255);
      }

      const exitData = this.processJSON(data);
      if (this.opts.json) {
        console.log(JSON.stringify(exitData.data));
      } else {
        console.log(
          'npm-auditor-ci found %d advisories.',
          exitData.data.length
        );
        if (exitData.code === 1) {
          console.log(
            cTable.getTable(Auditor.formatExitDataForAdvisory(exitData.data))
          );
        }
      }
      Auditor.exitWithCode(exitData.code);
    });
  }
}

export default Auditor;
