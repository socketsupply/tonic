#!/usr/bin/env node
import { start } from './index.js';

const root = process.argv[2];

start({ live: false, root });
