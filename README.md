# Blog Application – Backend API

This is a backend API for a blog application built with Java and Spring Boot. It provides endpoints for creating, editing, deleting, and fetching blog posts. Data is stored in a PostgreSQL database.

## 🛠 Technologies

- **Java 21**: Programming language
- **Spring Boot**: Framework for backend development
- **Spring Data JPA**: For database interaction
- **PostgreSQL**: Relational database
- **Maven**: Dependency management and build tool
- **Docker & Docker Compose**: For containerized database setup

## 📁 Project Structure

```
Blog_application/
├──blog/
│   ├── src/
│   │    ├── main/
│   │    │   ├── java/com/stasiu/blog/      # Core application logic
│   │    │   └── resources/                 # Configuration files
│   │    └── test/java/com/stasiu/blog/     # Unit tests
│   ├── pom.xml                             # Maven configuration
│   └── docker-compose.yml                  # PostgreSQL setup
└── README.md                               # Project documentation
```

## 🚀 Getting Started

### ✅ Prerequisites

- Java 21+
- Maven
- Docker (optional, for database setup)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Blog_application/blog
```

### 2. Start PostgreSQL with Docker

If PostgreSQL is not installed locally, use Docker:

```bash
docker-compose up -d
```

The database will be available on port `5432`. Credentials are defined in `application.properties`.

### 3. Run the Spring Boot Application

```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`.

## 🧪 Running Tests

Run unit tests for the backend:

```bash
./mvnw test
```

## 📌 Sample API Endpoints

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | `/api/posts`        | Get all posts           |
| GET    | `/api/posts/{id}`   | Get a single post       |
| POST   | `/api/posts`        | Create a new post       |
| PUT    | `/api/posts/{id}`   | Update a post           |
| DELETE | `/api/posts/{id}`   | Delete a post           |

## ⚙️ Configuration

Database configuration is located in:

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blog
spring.datasource.username=postgres
spring.datasource.password=postgres
```
