# Blog Application – Backend (Spring Boot)

This is a simple backend for a blog application built with Java and Spring Boot. It allows creating, editing, deleting, and fetching blog posts. Data is stored in a PostgreSQL database.

## 🛠 Technologies

- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Maven
- Docker & Docker Compose

## 📁 Project Structure

```
blog/
├── src/
│   ├── main/
│   │   ├── java/com/example/blog/     # Core application logic
│   │   └── resources/                 # Configuration files
│   └── test/                          # Unit tests
├── pom.xml                            # Maven configuration
├── docker-compose.yml                 # PostgreSQL setup
```

## 🚀 Getting Started

### ✅ Prerequisites

- Java 17+
- Maven
- Docker (optional, for database setup)

### 1. Start PostgreSQL with Docker

If you don't have PostgreSQL installed locally, you can run:

```bash
docker-compose up -d
```

The database will be available on port `5432`. Credentials are defined in `application.properties`.

### 2. Run the Spring Boot Application

```bash
cd blog
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`.

### 3. Test the API

Use Postman, curl or similar tools. Example endpoint:

```
GET http://localhost:8080/api/posts
```

## 🧪 Running Tests

To run unit tests:

```bash
./mvnw test
```

## ⚙️ Configuration

Configuration can be found in:

```
src/main/resources/application.properties
```

Database connection example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blog
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## 📌 Sample API Endpoints

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | `/api/posts`        | Get all posts           |
| GET    | `/api/posts/{id}`   | Get a single post       |
| POST   | `/api/posts`        | Create a new post       |
| PUT    | `/api/posts/{id}`   | Update a post           |
| DELETE | `/api/posts/{id}`   | Delete a post           |

## 👤 Author

Developed by [StasiuTomkowiak](https://github.com/StasiuTomkowiak) as a backend practice project.

## 📄 License

MIT License