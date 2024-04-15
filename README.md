# Process comparison

This project is a web-based application for process comparison analysis. It allows users to evaluate and compare different processes based on defined criteria. The application language is german.

## Live Dev-Build

I will host the current build at [klch.eu](https://klch.eu/) for a while. Head over to check it out!

## Installation

1. Clone the repository using `git clone https://github.com/ph-lk/prozessvergleich.git`.
2. Navigate to the project directory using `cd prozessvergleich`.
3. Install dependencies using `npm install`.

## Usage

1. Run the project using `npm start`.
2. Open your browser and navigate to `http://localhost:3000`.
3. Start using the application.

## Features

- **Processes**: Displays a list of available processes and allows users to activate or deactivate individual processes.
- **Weighting**: Enables users to set the weighting of different criteria to be used for comparing the processes.
- **Rating**: Allows users to input ratings for each criterion for each process.
- **Import / Export**: Provides the ability to import and export data to facilitate comparison between different users or sessions.
- **Analysis**: Shows a an analysis of the compared processes based on the set weightings and ratings.

## Data

- all of the comparison data used in this project is fully interchangeable
- check [/public/data](https://github.com/ph-lk/prozessvergleich/tree/main/public/data) for the defaults as well as the json schema to feed in different data
- data import is done via the ?data url parameter. check the import / export page of the application for more information

## Technologies

- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for developing server-side rendered web applications.
- **shadcn**: Customizable UI Components
- **Nivo**: Graphing library
- **Others**: Other technologies and libraries used are listed in the source code comments and dependencies.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Contact

For questions or suggestions, you can create an issue under https://github.com/ph-lk/prozessvergleich/issues
