# Fake COUNTER endpoint

Simple COUNTER service to test harvests

## Prerequisites
* [docker](https://www.docker.com/)
* [docker-compose](https://docs.docker.com/compose/)
* [npm](https://www.npmjs.com/)

## Installation

```bash
git clone https://github.com/ezpaarse-project/fake-counter-endpoint.git
cd fake-counter-endpoint
npm ci
```

## Start service

```bash
docker compose up -d
```

## Routing

Each folder in `src/routes` is supposed to be a separate COUNTER version. To add one, you'll need to add corresponding code into `src/routes/index.ts`.

Each folder inside a COUNTER version is supposed to be a COUNTER endpoint, with or without flaws. `index` is supposed to be working normally.

## Documentation

Once service is started, documentation is automatically generated and served under `/doc`.
