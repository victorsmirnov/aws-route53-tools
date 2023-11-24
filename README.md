[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# aws-route53-tools

Collection of one script to check AWS Route53 resources.

* Check hosted zones script fetches all public zones hosted in AWS Route53 default profile and compares
  NS servers returned by NS resolver with NS servers configured in AWS Route53. If there is a mismatch
  it will print an error message.

## Installation

Install globally:

```sh
npm install -g aws-route53-tools
```

Or run with [npx](https://docs.npmjs.com/cli/v7/commands/npx):

```sh
npx aws-route53-tools
```

## Usage

Run script with the default AWS profile.

```sh
$ a53
```
