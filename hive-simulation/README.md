# Project Overview
Intelligent agents meant to simulate hive behavior. The agents'(bees) intents are based on a state machine. Surrounding values and their own characteristics determine the behavior the agents will take. 


## Intents/Behavior

### Searching
Bees will search the grid for a potential food source. Bees have a range of 1 cell. Bees will not go to a cell they originally came from.

### Deposit
Bees deposit nectar to the hive and refill their energy reserves. It will share the food location to any bees with the Waiting intent. Then it goes to the Foraging intent.

### Foraging
Bee goes to the food location cell. If the bee cannot get a full inventory of nectar from the flowers of this location, it will change to the Searching intent. Else it will gather nectar, pollinate the cell and switch to the Deposit intent. Mores bees leads to more pollination. More pollination leads to more flowers. More flowers leads to more nectar.

### Recovering
If bee is searching and its energy goes below a certain threshold, it will return back to the hive to refill its energy. If there is enough honey in the hive, it will go back to its previous behavior. Else it will go to the Waiting intent.

### Waiting 
Bees in the Waiting intent will sit on the hive until a Bee with a Deposit intent completes the Deposit intent. The Deposit intent bee will give the food location. This acts as the way bees share new food locations to other bees at the hive(bees normally do this in a form of a dance). Waiting Bees will prioritize higher quality food sources and use the nectar from the Depositing bee to refill itself.

### Death
Death occurs when a Bee has no more energy. It will be removed from the grid as a result.

## Actions
Whenever bees move, they are doing an action.

### Pending
Bee is currently in motion to a location. Since the bee is in motion, it is expending energy depending on an interval.

### Completed
Bee is done with its movement. Its intent will then determine its behavior as listed above.

## Requirements
Node modules: 
cors, express, mongoose in the backend directory
react-start in hive-simulation directory

Misc. File:
A .env text file connecting a mongodb database to the application

## Available Scripts

In the project directory, you can run:

### `npm start` 

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

In the backend directory, you can run:

### `nodemon server` or `node server`

Runs the server
