# Supermarket delivery slot alerts
Currently only Iceland supported

## Install
Clone this repo and navigate to the root.
```
yarn global add file:$PWD
```
or
```
npm install -g .
```

## Run
```
findaslot
```
and follow the prompts.

## Enable notifier
With no notifier set, your terminal will alert. Pushover enables alerts to be sent to your phone.

Pushover (https://pushover.net/) is enabled when user and token are set.

Set environment variables `PUSHOVER_USER` and `PUSHOVER_TOKEN`

## Supermarkets
### Iceland - working 14th April 2020
* Ensure that you have at least one item in your basket already to reserve a slot
