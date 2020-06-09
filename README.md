# The Seed - Server

## Setup

Run `yarn`

Run `tsc`

Run `node dist\index.js`

Can Also press F5 inside Visual Studio Code while inside src/index.js and it will automatically watch for changes and rebuild, and run.

Should start to see server running, and processing empty actions

Can test out connecting a player and rendering by running code in the sample renderer repo : https://github.com/NikitaVr/the-seed-render 

## Core Loop




## When to Step

There are two options

### 1. Step Timer

Step Timer, where, for example, the server calculates a step every 2 seconds. 

If an agent sends an action late, the server will calculate the action on the next step. If on the next step the server receives a more recent action from the agent, it will discard the old action.

### 2. Wait for All

This step is waits until all connected agents send an action. This means fast agents can train very quickly, and slow agents can take the time they need.
