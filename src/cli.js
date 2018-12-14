import meow from 'meow';

export const cli = meow(
  `
  Usage
	  $ npm-auditor-ci

	Options
	  --help,      -h  Displays help information
	  --threshold, -t  The threshold in which the auditor fails ('low', 'moderate', 'high', 'critical')
	  --ignoreDev  -i  Ignores dev dependencies (default false)
	  --json       -j  Displays results in json format (default false)
   --registry   -r  Specifies which registry to use. Default (https://registry.npmjs.org/)

	Examples
	  $ npm-auditor-ci --json --registry=https://npm.mycompany.com/
	  Runs json with a different npm registry url

   $ npm-auditor-ci --ignoreDev --threshold=high
   Runs ignoring the dev dependencies and only fails on high level advisories

 Help
   Have a problem? Want to help support?
   https://www.github.com/willywos/npm-auditor-ci
   Cheers! 🍻
`,
  {
    booleanDefault: undefined,
    flags: {
      threshold: {
        type: 'string',
        alias: 't',
        default: 'low'
      },
      ignoreDev: {
        type: 'boolean',
        default: false,
        alias: 'i'
      },
      json: {
        type: 'boolean',
        alias: 'j',
        default: false
      },
      registry: {
        type: 'string',
        default: 'https://registry.npmjs.org/',
        alias: 'r'
      }
    }
  }
);
