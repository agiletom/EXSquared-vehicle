# EX Squared LATAM Assessment - Vehicle

This is a NestJS-based application that includes GraphQL integration, MongoDB with Mongoose, and Dockerization. The project is set up with a CI/CD pipeline using GitHub Actions, and the application is containerized with Docker for production.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Docker Setup](#docker-setup)
    - [Build Docker Image](#build-docker-image)
    - [Run with Docker Compose](#run-with-docker-compose)
    - [Stopping the Containers](#stopping-the-containers)
    - [Rebuilding the Docker Images](#rebuilding-the-docker-images)
    - [Logs](#logs)
- [CI/CD Pipeline](#cicd-pipeline)
- [Technologies](#technologies)

## Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **MongoDB** (Ensure MongoDB is installed and running)
- **Docker** (for containerized environment)

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/agiletom/EXSquared-vehicle
    cd EXSquared-vehicle
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**: Create a `.env` file at the root of your project and add the necessary environment variables:
    ```bash
    DATABASE_URL=mongodb://localhost:27017/vehicle
    DATABASE_MAX_POOL_LIMIT=50
    FETCH_WITH_RETRY_TIMES=3
    ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run start:dev
```

## Docker Setup
### Build Docker Image
```bash
docker build -t nest-app .
```
### Run with Docker Compose
```bash
docker-compose up --build
```
- Build the NestJS app and MongoDB containers.
- Start MongoDB on port `27017` .
- Start the NestJS app on port `3000` .
### Stopping the Containers
```bash
docker-compose down
```
### Rebuilding the Docker Images
```bash
docker-compose up --build
```
### Logs
```bash
docker-compose logs -f
```

### Docker Setup
### Build Docker Image
```bash
docker build -t vehicle-app .
```
### Run with Docker Compose
```bash
docker-compose up --build
```
- Build the app and MongoDB containers.
- Start MongoDB on port `27017` .
- Start the app on port `3000` .
### Stopping the Containers
```bash
docker-compose down
```
### Rebuilding the Docker Images
```bash
docker-compose up --build
```
### Logs
```bash
docker-compose logs -f
```

## Technologies
- **NestJS** - A progressive Node.js framework for building efficient, reliable, and scalable applications.
- **GraphQL** - A query language for your API to give clients the power to ask for exactly what they need.
- **MongoDB** - NoSQL database for the backend.
- **Mongoose** - ODM for MongoDB.
- **Jest** - A delightful JavaScript testing framework with a focus on simplicity.
- **Docker** - A container platform to build, ship, and run distributed applications.
- **GitHub Actions** - CI/CD pipeline for automated tests and Docker deployment.

### Key Points:
1. **Getting Started**: Installation and setup instructions.
2. **Running the Application**: Explains how to run the app in different modes (development, production, Docker).
3. **CI/CD Pipeline**: Explains the automated pipeline and GitHub Actions setup.
4. **Technologies**: Lists the technologies used in the project.
