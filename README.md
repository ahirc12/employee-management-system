# Employee Management System

A full-stack Employee Management System built to practice modern frontend development, backend API development, and database management.

## Tech Stack

**Frontend**
- Angular 22
- TypeScript
- Tailwind CSS
- Signals and standalone components

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA
- REST APIs
- Gradle

**Database**
- PostgreSQL

## Features

- View employees with server-side pagination and sorting
- Search employees by name
- Filter employees by department and salary
- Add, update, view, and delete employees
- Form validation and structured API error handling
- PostgreSQL integration and database indexing
- Responsive user interface

## Project Structure

```text
employee-management-system/
├── employee-management-ui/        # Angular frontend
└── employee-management-service/   # Spring Boot backend
```

## Getting Started

### Prerequisites

- Node.js and npm
- Angular CLI
- Java 21
- Gradle
- PostgreSQL

### 1. Configure the Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE employee_management;
```

Configure your database URL, username, and password in the backend's `application.properties` file.

**Note:** Keep database credentials and other secrets out of version control.

### 2. Run the Backend

Navigate to the backend directory:

```bash
cd employee-management-service
gradle bootRun
```

The backend runs on `http://localhost:8080`.

### 3. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd employee-management-ui
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

## API

**Base URL:** `http://localhost:8080/api/employees`

The API supports employee CRUD operations, pagination, sorting, searching, and filtering.

## Purpose

This project is part of my hands-on learning journey toward full-stack development, focusing on Angular, Spring Boot, REST API design, automated testing, and PostgreSQL.
