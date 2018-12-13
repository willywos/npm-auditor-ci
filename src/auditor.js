import * as child from 'child_process';
import _ from 'lodash';
import cTable from 'console.table';

class Auditor {
  opts = {};

  severities = ['low', 'moderate', 'high', 'critical'];

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
    let severityIndex = this.severities.indexOf(threshold);
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

  static formatExitDataForAdvisory(data) {
    const tableData = data.map(item => {
      return {
        name: item.module_name,
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
      if (err !== null) {
        console.log('npm-auditor-ci encountered an unexpected error.');
        console.log(stderr);
        Auditor.exitWithCode(255);
      }

      let data = JSON.parse(stdout);
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
            cTable.getTable(this.formatExitDataForAdvisory(exitData.data))
          );
        }
      }
      Auditor.exitWithCode(exitData.code);
    });
  }
}

export default Auditor;
