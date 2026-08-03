#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

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
