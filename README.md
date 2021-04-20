# Occupancy data generation
This program generates occupancy data for a Workspace Utilization platform. The generated data simulates a normal workload for an office building, where employees would have set working hours and office spaces would have different capacities and total headcount. The measurement of occupancy would be done by occupancy sensors, attached to the desks of employees. Each day is split into 144 `10 minute time slots` for a more robust utilization analysis. The entry point of the program is `./src/main.ts` where several things happen:
1. Using the exceljs module, the tables dimDate.csv and dimTimeSlot.csv are read and the time slot configurations are created.
2. The `relational_structure.json` file is read and all possible sensor configurations are created and mapped to their respective real estates (sensors to spaces to floors to buildings, etc...). This creates all real estate configurations.
3. Capacities are generated for all sensors and are written in a separate .csv file.
4. Headcounts are generated for all sensors (assigned employees and expected visitors) and the data is stored in a separate .csv file.
5. Finally the occupancy data is generated based on the time slot configurations, real estate configurations, capacities and headcounts. A single sensor would have 144 occupancy entries per day. The data is streamed into 2 separate .csv tables - v1 and v2 The difference in these tables is the data model, where the v1 model would have capacity and headcount IDs for each entry and they would be read from the respective generated tables (This is done so that the generated data can simulate versioning and data normalization) and the v2 table includes the capacity and headcount values directly.

***

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Instalation](#instalation)
3. [Build](#build)
4. [Run](#run)
5. [Maintenance](#maintenance)

***

## Prerequisites
To run this script you need to have
- NodeJS 12.x+
- NPM (Automatically installed alongside NodeJS on Windows, but requires manual installation on MacOS or GNU/Linux).

***

## Instalation
1. Open a terminal in the project root directory and navigate to data-generation/spohisticated-results
2. Run ```npm install``` and wait for the dependencies to be satisified.

***

## TypeScript Configuration
You can find the TypeScript config file in the root directory. 

***

## Build
Since this is a TypeScript project, you will need to compile the TS code into a NodeJS-readable JavaScript code. To do that, simply run `npm run build` and the compiled code will be built in the `./dist` directory.
***

## Run
The configuration is located in `./src/enums/config.ts`.
### In the current input directoy you will find the files ```dimTimeSlot.csv``` and ```dimDate.csv```. The script reads these files and generates data based on them.
### Keep in mind that when generating data for a full month and for more than 200 sensors the script will require more RAM (more than the default amount - 1gb). To allow nodejs to use more RAM you need to provide the following argument: ```--max-old-space-size=xxxx``` where xxxx would be the amount - for example ```8192```. This argument is automatically provided if you use the `npm start` command.
### The script requires the path to the ```relational_structure.json`` to be provided as a command line argument.
You will find a sample `relational_structure.json` file in the `./input` directory.

To run the script use the following command:

`npm start ./input/relational_structure.json`

***

## Maintenance
The script has a configured linter and prettier. Simply run ```npm run code:format``` to perform checks on the script and make sure that it is formatted properly.

***