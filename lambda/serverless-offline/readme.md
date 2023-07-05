# serverless implementation

## Installation

Node version: 16

1. First, add Serverless Offline to your project:

```bash
npm install serverless-offline --save-dev
```

2. Then inside your project's serverless.yml file add following entry to the plugins section: serverless-offline. If there is no plugin section you will need to add it to the file.

**Note that the "plugin" section for serverless-offline must be at root level on serverless.yml.**

It should look something like this:

```yml
plugins:
  - serverless-offline
```

## Usage and command line options

1. In your project root run:

```
serverless offline or sls offline
```

2. To Deploy

```
serverless deploy or sls deploy
```

## To deploy follow the instruction

1. Create an IAM User
2. Add supported permission (AWSCloudFormationFullAccess, AWSCloudFormationReadOnlyAccess)
