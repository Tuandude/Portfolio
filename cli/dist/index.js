#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
program
    .name('gitstory')
    .description('GitStory AI - The Interactive Project Biographer')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize GitStory hook in the repository')
    .action(() => {
    console.log('Initializing GitStory...');
});
program.parse(process.argv);
