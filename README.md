# WFL

Log Management System

## Table of Contents

- [Install](#install)
- [Introduction](#introduction)
- [Configuration](#configuration)

## Install

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/). Node.js 0.6 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm i wfl
```

## Introduction

A log management system, which can help manage logs more easily.

Here is an example on how to use it:

```js
let Log = require('wfl');

Log.error('Username Invalid');
```

## Configuration

Add this json object to the root object of the package.json file

```json
{
  "wfl": {
    "size": "15m",
    "where": {
      "error": "18m"
    },
    "path": "./Logger",
    "offset": "2h",
    "accessToDelete": true
  }
}
```

###Example


```json
{
  "name": "simple-test",
  "version": "1.0.0",
  "description": "This is a simple app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "wfl": {
    "size": "15m",
    "where": {
      "error": "18m"
    },
    "path": "./Logger",
    "offset": "2h",
    "accessToDelete": true
  }
}
```



<br />

`Path` => `File storage location`<br /><br />
`Size` => `Maximum size of each file`<br /><br />
`Where` => `Delete old files from some folders`<br /><br />
`Offset` => `Maximum time for delete old file`<br /><br />
`AccessToDelete` => `update Disables deleting old files from disk`
