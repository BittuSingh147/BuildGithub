[![progress-banner](https://backend.codecrafters.io/progress/git/d0163e24-b77a-44e3-9263-cffb10c6ae10)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

This is a starting point for JavaScript solutions to the
["Build Your Own Git" Challenge](https://codecrafters.io/challenges/git).

In this challenge, you'll build a small Git implementation that's capable of
initializing a repository, creating commits and cloning a public repository.
Along the way we'll learn about the `.git` directory, Git objects (blobs,
commits, trees etc.), Git's transfer protocols and more.

**Note**: If you're viewing this repo on GitHub, head over to
[codecrafters.io](https://codecrafters.io) to try the challenge.

# Passing the first stage

The entry point for your Git implementation is in `app/main.js`. Study and
uncomment the relevant code, and push your changes to pass the first stage:

```sh
git commit -am "pass 1st stage" # any msg
git push origin master
```

That's all!

# Stage 2 & beyond

Note: This section is for stages 2 and beyond.

1. Ensure you have `node (21)` installed locally
1. Run `./your_program.sh` to run your Git implementation, which is implemented
   in `app/main.js`.
1. Commit your changes and run `git push origin master` to submit your solution
   to CodeCrafters. Test output will be streamed to your terminal.

# Testing locally

The `your_program.sh` script is expected to operate on the `.git` folder inside
the current working directory. If you're running this inside the root of this
repository, you might end up accidentally damaging your repository's `.git`
folder.

We suggest executing `your_program.sh` in a different folder when testing
locally. For example:

```sh
mkdir -p /tmp/testing && cd /tmp/testing
/path/to/your/repo/your_program.sh init
```

To make this easier to type out, you could add a
[shell alias](https://shapeshed.com/unix-alias/):

```sh
alias mygit=/path/to/your/repo/your_program.sh

mkdir -p /tmp/testing && cd /tmp/testing
mygit init
```
Git Blob Object Storage Implementation
This project implements a basic version of Git's object storage, specifically focusing on the git hash-object command. The goal is to create, hash, and optionally store a blob object in a Git-like structure.

Overview
In this step, you will implement the logic to:

Compute the SHA-1 hash of a file, including its header (blob <size>\0).
Store the file as a blob object in a .git/objects directory, similar to how Git handles objects.
If requested, compress the object using zlib before storing it in the .git/objects directory.
Requirements
The program should print the SHA-1 hash of the file to the console.
If the -w flag is passed, it should store the object in a .git/objects directory. The object should be compressed before storage using zlib.
The object storage directory should be organized by the first two characters of the SHA-1 hash.
How It Works
Step-by-Step Process
File Reading:

The program reads the contents of the file you specify.
Header Creation:

A header is created in the format: blob <file_size>\0, where <file_size> is the byte length of the file content, and \0 is a null byte.
Hashing:

The program combines the header and the file contents, then computes the SHA-1 hash over the combined data.
Compression (Optional):

If the -w flag is passed, the program compresses the object (the header + file contents) using zlib and stores it in a folder structure within .git/objects/, organized by the first two characters of the hash.
Output:

The program outputs the 40-character SHA-1 hash of the object.
Example
1. Initialize the Git repository:
bash
Copy code
$ ./your_program.sh init
2. Hash a file and print its hash:
bash
Copy code
$ ./your_program.sh hash-object <file_path>
Example:

bash
Copy code
$ ./your_program.sh hash-object test.txt
3b18e512dba79e4c8300dd08aeb37f8e728b8dad
3. Hash and store the object (with -w flag):
bash
Copy code
$ ./your_program.sh hash-object -w test.txt
This will store the object in .git/objects with the corresponding compressed object file.

Git Object Storage Directory Structure
The object is stored in the .git/objects/ directory.
The directory is organized by the first two characters of the SHA-1 hash.
The remaining characters of the SHA-1 hash are used as the file name.
For example, for a hash like 3b18e512dba79e4c8300dd08aeb37f8e728b8dad, the file would be stored in .git/objects/3b/18e512dba79e4c8300dd08aeb37f8e728b8dad.

Notes
The object file is not stored in its raw form. It is compressed using zlib before being saved in .git/objects.
The program hashes the uncompressed content of the file, including the header (blob <size>\0) and the file content.
The -w flag is optional. It tells the program to write the object to the .git/objects directory.
Technologies Used
Node.js: JavaScript runtime environment.
fs (File System): For reading files and interacting with the file system.
crypto: To calculate the SHA-1 hash.
zlib: For compressing the object before storage.
