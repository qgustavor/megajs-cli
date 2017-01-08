# MEGAJS CLI

The CLI version of [MEGAJS](https://www.npmjs.com/package/megajs), inspired by [megatools](https://megatools.megous.com/man/megatools.html).

**Work in progress**: code *isn't* working, documentation exists only as a implementation guide.

## Installation:

```bash
# Install Node: https://nodejs.org/
npm install -g megajs-cli
```

## Commands:

To make this tool easier to MEGA users the commands are the same of megatools. Arguments are the same. If implementation may differ open a issue.

But there is a difference: instead of having multiple executables this tool just have one. Instead of "mega*command*" use "megajs *command*". Example: "megajs dl" instead of "megadl". You can use also the longer name, shown below, like "megajs download".

### Arguments for all commands:

* `--u` `--username` `--email`: account email
* `--p` `--password`: account password
* `--no-ask-password`: don't prompt for a password
* `--proxy`: proxy server to use, more info on [request documentation]( https://www.npmjs.com/package/request/#proxies)
* `--speed-limit <speed>`: limit download/upload speed, if no unit is specified it defaults to KiB/s 
* `--config <path>`: load configuration from a file
* `--ignore-config-file`: ignore user's `.megajsrc`
* `--version`: show package info then exits

### *dl*: download

Downloads shared files and folders

```bash
# downloads a test file to the current folder
megajs dl <shared file or folder>
megajs dl https://mega.nz/#!N90lwbqL!MkbqwNRYPF4uFCN35zetE3PHOzP-NQc20hasZxPg5k8
```

If a folder is specified each file will be downloaded if not exists.

Supported arguments:

* `--path`: directory to download to, defaults to current working directory, `-` for stdout
* `--no-progress`: do not report progress

How to download single files in folders:

```bash
$ megajs ls --human --long --header "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing"
===================================================================================
Handle      Owner       T          Size Mod. Date           Filename
===================================================================================
Ql0jyZIR    V0xJ8QbgnD0 0       1.0 KiB 1970-01-01 00:00:00 example-1.txt
QwFnHI4D    V0xJ8QbgnD0 0       2.0 KiB 1970-01-01 00:00:00 example-2.txt

$ megajs dl "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing!Ql0jyZIR"
example-1.txt was downloaded
```

The URL above is only supported to link to sub-folders in the web client, but we extend it to files. More info see help on [the list command](#ls-list).

### *put*: upload

Downloads shared files and folders

```bash
# downloads a test file to the current folder
megajs dl "https://mega.nz/#!N90lwbqL!MkbqwNRYPF4uFCN35zetE3PHOzP-NQc20hasZxPg5k8"
```

Supported arguments:

* `--path`: directory to upload to, defaults to root directory
* `--preview <path>`: upload custom preview image (JPEG 75%, maximum width and height = 1000px)
* `--thumbnail <path>`: upload custom thumbnail image (JPEG 70%, 120x120 px)
* `--no-progress`: do not report progress
* `--disable-previews`: disable automatic thumbnails and preview images generation

### *ls*: list

Lists files in folders

```bash
# list all files from a user
megajs ls

# list files from a user folder
megajs ls /Root

# list files from a shared folder
megajs ls "https://mega.nz/#F!98NDUTDK!3GatsuNoLion-IsAmazing"
```

Supported arguments:

* `--human`, `-h`: format size values instead of returning bytes
* `--long`, `-l`: long format, showing node handle, node owner, node type, size, modification date, then filename
* `--header`, `-h`: prepend an header to the result
* `--names`, `-n`: only show file names, equivalent to UNIX's ls `--almost-all`
* `--recursive`, `-R`: list all files and folders recursively, default when no path specified

In order to keep compatibility sharing functions are handled by this command:

* `--export`, `-e`: export the selected file or folder
* `--key`: folder key (22 character string ending with A, Q, g or w)  
  Keys don't need to be random: use when your folder contents are meant to be public and you want nicer URLs.

### *mkdir*

Creates a folder

```bash
megajs mkdir "/Root/Example"
megajs mkdir "/Root/Example Folder"
```

Creating a folder in contacts isn't supported (at least it isn't tested).

### *copy*

"Copies" an local directory to a remote one, or vice-versa.

```bash
# Sync remote with local
megajs copy --local LocalFolder --remote /Root/RemoteFolder
# Sync local with remote
megajs copy --local LocalFolder --remote /Root/RemoteFolder --download
```

Supported arguments:

* `-n`, `--dryrun`: don't download or upload files, instead just print what will be done
* `--no-progress`: disable progress reporting
* `--disable-previews`: disable automatic thumbnails and preview images generation

## Not supported commands:

Registration (megareg) and quota commands (megadf) aren't supported because the underlining library doesn't support it.

File and folder removing (megarm) and downloading files where logged in (megaget) aren't supported by now because the main focus by now is implementing functions that may help MEGA scripting, and seems those functions are less used on scripting than the others.
