#!/usr/bin/env node

import { cli } from './cli';
import Auditor from './auditor';

new Auditor(cli.input[0], cli.flags).run();
