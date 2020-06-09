# The Seed - Server

## Setup

Run `yarn`

Run `tsc`

Run `node dist\index.js`

Can Also press F5 inside Visual Studio Code while inside src/index.js and it will automatically watch for changes and rebuild, and run.

Should start to see server running, and processing empty actions

Can test out connecting a player and rendering by running code in the sample renderer repo : https://github.com/NikitaVr/the-seed-render 

## Initialize State

## Core Loop

1. Agents Connect ( this can really be done at any point )
1. Server sends State
1. Agent
    1. Calculate Reward
    1. Calculate new Action
    1. Send new Action to Server
1. Server
    1. Receives Actions
    1. Identify Conflicts
    1. Resolve Conflicts
    1. Take Actions -> New State
    1. Apply Environment Built In Changes (ex. berries growing )
    1. Send new State
1. Repeat

## When to Step

There are two options

### 1. Step Timer

Step Timer, where, for example, the server calculates a step every 2 seconds. 

If an agent sends an action late, the server will calculate the action on the next step. If on the next step the server receives a more recent action from the agent, it will discard the old action.

### 2. Wait for All

This step is waits until all connected agents send an action. This means fast agents can train very quickly, and slow agents can take the time they need.
