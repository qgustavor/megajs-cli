# MEGAJS CLI

The CLI version of [MEGAJS](https://www.npmjs.com/package/megajs), inspired by [megatools](https://megatools.megous.com/).

**Development stopped**: megatools support new accounts and way more features, this tool is not needed. It will be kept was a way to test MEGAJS with real servers and as a way to use custom thumbnail images. Issues will be fixed but *no* new features will be implemented.

## Installation:

Install it using `npm install -g megajs-cli` or `pnpm add --global megajs-cli` or [download a pre-built binary](https://github.com/qgustavor/megajs-cli/releases).

## Usage:

To make this tool easier to MEGA users the commands are the same of megatools, same with the arguments: just replace "megatools" with "megajs".

### Arguments for all commands:

* `-u --username <email>`: account email
* `-p --password <password>`: account password
* `--no-ask-password`: don't prompt interactively for a password
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
* `--allow-unsafe-http`: download files using unsafe HTTP

You can download single files in folders by specifing the file handle:

```bash
$ megajs ls --human --long --header "https://mega.nz/#F!ExampleE!xampleExampleExampleEx"
=============================================================
Handle   Owner    T    Size Mod. Date           Filename
=============================================================
HandleAA OwnerID 0 1.0 KiB 1970-01-01 00:00:00 example-1.txt
HandleZZ OwnerID 0 2.0 KiB 1970-01-01 00:00:00 example-2.txt

$ megajs dl "https://mega.nz/#F!ExampleE!xampleExampleExampleEx!HandleAA"
example-1.txt was downloaded
```

You can also use regular expressions and glob expressions, [like wget](https://www.gnu.org/software/wget/manual/wget.html#Recursive-Accept_002fReject-Options-1):

* `-A acclist --accept acclist`: *only* download files which match the specified glob expression
* `-R rejlist --reject rejlist`: *don't* download files which match the specified glob expression
* `--accept-regex urlregex`: *only* download files which match the specified regular expression
* `--reject-regex urlregex`: *don't* download files which match the specified regular expression
* `--ignore-case`: ignore case when matching files

```bash
$ megajs dl "https://mega.nz/#F!ExampleE!xampleExampleExampleEx" -A "*1.txt"
example-1.txt was downloaded
```

Using unsafe HTTP may leak information about what's being downloaded to network administrators/ISP if the content being downloaded is already known or if the content was uploaded from a vulnerable MEGA client using weak encryption keys (those exist and are popular), but using it can reduce issues with MEGA servers since that's the default behavior in other clients.

Limiting the number of connections to 1 will disable download chunking which is known to reduce issues with MEGA servers and, sometimes, result in faster downloads than the default 4 connections.

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
* `--allow-unsafe-http`: upload files using unsafe HTTP

Note that the underlining library don't support parallel connections when uploading, but pull requests adding this feature are appreciated.

Using unsafe HTTP may leak information about what's being uploaded to network administrators/ISP if the encryption gets leaked or published, but using it can reduce issues with MEGA servers since that's the default behavior in other clients.

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

## Credits

Part of the CLI code was inspired on [Firebase CLI](https://github.com/firebase/firebase-tools) by Firebase and [WebTorrent CLI](https://github.com/feross/webtorrent-cli) by WebTorrent, LLC, both MIT Licensed.
