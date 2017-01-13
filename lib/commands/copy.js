module.exports = (program) => program
  .command('copy [local] [remote]')
  .description('Copies an local directory to a remote one, or vice-versa.')
  .option('-l --local <path>', 'local path')
  .option('-r --remote <path>', 'remote path')
  .option('-n --dryrun', "don't download or upload files, instead just print what will be done")
  .option('--no-progress', 'disable progress reporting')
  .option('--disable-previews', 'disable automatic thumbnails and preview images generation')
  .addLoggedOptions()
  .action(handler)

const handler = (cmd, options) => {
  console.error('ERROR: not implemented')
  process.exit(1)
}
