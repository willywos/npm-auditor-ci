

![Screenshot](npm-auditor-logo.jpg)

# npm-auditor-ci

[![Build Status](https://travis-ci.org/willywos/npm-auditor-ci.svg?branch=master)](https://travis-ci.org/willywos/npm-auditor-ci)
[![Maintainability](https://api.codeclimate.com/v1/badges/e2ef554d23dd942f6bbd/maintainability)](https://codeclimate.com/github/willywos/npm-auditor-ci/maintainability)

NPM Auditor CI is meant to be used inside your JS project or
globally on your CI environment. It returns the correct exit code and wraps npm audit to provide additional features.


## Installation

Global Installation
```
$ npm install npm-auditor-ci -g
```

Project Installation
```
$ npm install npm-auditor-ci --save-dev
```

## Usage

Global

If you are using it as a global installation make
sure you have installed the package and have used
npm install to generate the package-lock.json that
npm audit needs.

```
$ cd ~/<my_project>/
$ npm-auditor-ci
```

Project

Inside your package.json you can add a custom script

```
"scripts": {
  "audit": "npm-auditor-ci --threshold low --registry https://registry.mydomain.com/"
},
```

Then inside of your project folder you can run

```
$ npm run audit
```

or you can add the npm command to an existing script like

```
"scripts": {
  "audit": "npm-auditor-ci --threshold low --registry https://registry.mydomain.com/",
  "tests": "mocha tests/",
  "ci":"npm run tests && npm run audit"
},
```

### Options

You can view the help section by running ```npm-auditor-ci --help```

| Options       | Argument                       |Default                     | Description                         |
| ------------- |:------------------------------|-----------------------------|:------------------------------------:|
| --help        |                               |                             | Displays the help information below |
| --threshold   | low, moderate, high, critical | low                         | |
| --ignoreDev   | true or false                 | true                        | Decide to include development dependencies.    |
| --json        | true or false                 | false                       | Outputs the results from the audit in JSON.    |
| --registry    | https://registry.npmjs.org    | https://registry.npmjs.org  | Use a custom registry or the default npmjs.org |

If you specify a threshold of critical it's essentially running all advisories. It takes the level and alerts on all levels below that one.

For example if I use moderate

```
$ npm-auditor-ci --threshold moderate
```

I will get all advisories that are moderate AND also low. If you do high, you will get all advisories that are high, moderate and low.


```

  A wrapper for 'npm audit' which can be used in CI.

   Usage
    $ npm-auditor-ci

  Options
    --help,      -h  Displays help information
    --threshold, -t  The threshold in which the auditor fails ('low', 'moderate', 'high', 'critical') (default 'critical')
    --ignoreDev  -i  Ignores dev dependencies (default on)
    --json       -j  Displays results in json format (default off)
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
```



### Contributing

Open an issue, or make a pull request. We love contributions.

If you would like to contribute, please make sure you
follow the contribution guidelines inside contributing.md.

#### Development

```
$ git clone https://github.com/willywos/npm-auditor-ci.git
$ cd npm-auditor-ci
$ npm install
$ npm run dev

➜ npm run dev

> npm-auditor-ci@0.0.1 dev /Users/willywos/Projects/npm-auditor-ci
> babel -w src/ --out-dir dist --copy-files --ignore __tests__

Successfully compiled 3 files with Babel.
```

To run the unit tests
```
$ npm run test
```
or
```
$ npm run test:watch
```

Run the ci command locally before pushing.

```
$ npm run ci
```

To run the app locally to test:
```
$ node dist/index.js --help
```

### Code of Conduct

Code is important but people are more important. If you like to contribute to npm-auditor-ci please read and follow our code of conduct found in this file: CODE_OF_CONDUCT.md
