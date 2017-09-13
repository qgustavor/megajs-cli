# MEGAJS CLI

The CLI version of [MEGAJS](https://www.npmjs.com/package/megajs), inspired by [megatools](https://megatools.megous.com/man/megatools.html).

**Work in progress**: download, upload, list and mkdir should be working, but they're not fully tested. Also the following features aren't implemented: automatic thumbnail generation, loading configuration from a file and caching.

## Installation:

```bash
# Install Node: https://nodejs.org/
npm install -g megajs-cli
```

## Usage:

To make this tool easier to MEGA users the commands are the same of megatools, same with the arguments. Results differ: if it breaks some automation script open a issue.

But there is a difference: instead of having multiple executables this tool just have one. Instead of "mega*command*" use "megajs *command*". Example: "megajs dl" instead of "megadl". You can use also the longer name, shown below, like "megajs download".

### Arguments for all commands:

* `-u --username <email>`: account email
* `-p --password <password>`: account password
* `--no-ask-password`: don't prompt interactively for a password
* `--proxy <url>`: proxy server to use, more info on [request documentation](https://www.npmjs.com/package/request/#proxies)
* `--speed-limit <speed>`: limit download/upload speed, if no unit is specified it defaults to KiB/s 
* `--config <path>`: load configuration from a file
* `--ignore-config-file`: ignore user's .megajsrc
* `--version`: show package info then exits

### *dl*: download

Downloads shared files and folders

```bash
# downloads a test file to the current folder
megajs dl <shared file or folder>
megajs dl https://mega.nz/#!N90lwbqL!MkbqwNRYPF4uFCN35zetE3PHOzP-NQc20hasZxPg5k8
```

If a folder is specified each file will be downloaded. If the download file exists it will not be replaced.

Supported arguments:

* `--path <dir>`: directory to download to, defaults to current working directory, use `-` for stdout
* `--connections <num>`: the number of parallel connections, defaults to 4
* `--no-progress`: do not report progress
* `-c --continue`: continue an interrupted download

How to download single files in folders:

```bash
$ megajs ls --human --long --header "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing"
=============================================================
Handle   Owner    T    Size Mod. Date           Filename
=============================================================
Ql0jyZIR tZNhBYDl 0 1.0 KiB 1970-01-01 00:00:00 example-1.txt
QwFnHI4D tZNhBYDl 0 2.0 KiB 1970-01-01 00:00:00 example-2.txt

$ megajs dl "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing!Ql0jyZIR"
example-1.txt was downloaded
```

The URL above is only supported to link to sub-folders in the web client, but we extend it to files. More info see help on [the list command](#ls-list).

*Note:* is possible that the current speed limit implementation will only reduce file writing speed, not download speed. This feature wasn't well tested and implemented yet.

### *put*: upload

Uploads files to MEGA

```bash
# downloads a test file to the current folder
megajs put test.txt
```

Supported arguments:

* `--path <dir>`: directory to upload to, defaults to root directory
* `--preview <path>`: upload custom preview image (JPEG 75%, maximum width and height = 1000px)
* `--thumbnail <path>`: upload custom thumbnail image (JPEG 70%, 120x120px)
* `--no-progress`: do not report progress
* `--disable-previews`: disable automatic thumbnails and preview images generation

Note that the underlining library don't support parallel connections when uploading, but pull requests adding this feature are appreciated.

### *ls*: list

Lists files in remote folders

```bash
# list all files from a user
megajs ls

# list files from a user folder
megajs ls /Root

# list files from a shared folder
megajs ls "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing"
```

Supported arguments:

* `-h --human`: format size values instead of returning bytes
* `-l --long`: long format, showing node handle, node owner, node type, size, modification date, then filename
* `-h --header`: add an header to the result
* `-n --names`: show file names instead of full paths and hide folders
* `-R --recursive`: list all files and folders recursively, default when no path specified

In order to keep compatibility sharing functions are handled by this command:

* `-e --export`: export the selected file or folder
* `-k --key <key>`: exported folder key (22 character string ending with A, Q, g or w)  
  Keys don't need to be random: use when your folder contents are meant to be public and you want nicer URLs.

### *mkdir*

Creates a folder in MEGA

```bash
megajs mkdir "/Root/Example"
megajs mkdir "/Root/Example Folder"
```

Creating a folder in contacts isn't supported.

### *thumbnail* / *preview*

Uploads a thumbnail or preview image to a already uploaded file.

```bash
# Upload a thumbnail image
megajs thumbnail /Root/RemoteFile.ext thumbnail-image.jpg
# Upload a preview image
megajs preview /Root/RemoteFile.ext preview-image.jpg
```

The thumbnail and preview images follow the same rules as in the [put command](#put-upload). Any file accepts thumbnails and preview images, so be creative.

## Not supported commands:

Registration (megareg) and quota commands (megadf) aren't supported because the underlining library doesn't support it. Would be great if someone send a pull request adding those features...

File and folder removing (megarm), copying files (megacopy) and downloading files where logged in (megaget) aren't supported *by now* because the main focus by now is implementing functions that may help MEGA scripting, and seems those functions are less used on scripting than the others.

## Credits

Part of the CLI code was based on [Firebase CLI](https://github.com/firebase/firebase-tools) by Firebase and [WebTorrent CLI](https://github.com/feross/webtorrent-cli) by WebTorrent, LLC, both MIT Licensed.
