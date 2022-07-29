# Fouramedia Backend

It is the repo for 99 ventures

## Installation

use [docker](https://docs.docker.com/engine/install/) to start development environment.

at first copy all the fields from .env.example file and create a .env file in the root folder and put all the details

Then run the following command to set up the dev environment

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Ports
all the ports are declared inside .env file

## Access SSH of a container
```bash
docker-exec -it <container-id> bash
```
## Sequelize CLI command to create migrations and models
npx sequelize-cli model:generate --name ModelName --attributes col1:datatype,col2:datatype, ...

## Run migrations and rollbacks
npx sequelize db:migrate
npx sequelize db:migrate:all
npx sequelize db:migrate:undo
npx sequelize db:migrate:undo:all

## Run Seeders and rollbacks
npx sequelize db:seed --seed filename.js
npx sequelize db:seed:all
npx sequelize db:seed:undo:all
## Contributing
Pull requests are welcome. Create a pull request and wait for admin to merge it
