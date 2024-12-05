# Node Simulations Backend

This is the backend service for the Node Simulations application. It provides APIs to manage and run simulations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/node-simulations.git
    ```
2. Install dependencies:
    ```sh
    pip install -r "requirements.txt"
    ```

## Usage

1. Start the server:
    ```sh
    ./uvicorn.sh
    or 
    ./run.sh --dev
    ```
2. Run the following command to get the .env file
    ```
    ./envgen.sh
    ```
3. The server will be running at `http://localhost:8000`.
