# Blog Application – Backend API

This is a backend API for a blog application built with Java and Spring Boot. It provides endpoints for creating, editing, deleting, and fetching blog posts. Data is stored in a PostgreSQL database.

## 🛠 Technologies

- **Java 21**: Programming language
- **Spring Boot**: Framework for backend development
- **Spring Security**: Secure API endpoints
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
git clone https://github.com/StasiuTomkowiak/Blog_application
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

| Method | Endpoint                     | Description             |
|--------|------------------------------|-------------------------|
| GET    | `/api/v1/posts`              | Get all posts           |
| GET    | `/api/v1/posts/draft`        | Get all draft post      |
| POST   | `/api/v1/posts`              | Create a new post       |
| PUT    | `/api/v1/posts/{id}`         | Update a post           |
| DELETE | `/api/v1/posts/{id}`         | Delete a post           |
| GET    | `/api/v1/tags`               | Get all tags            |
| DELETE | `/api/v1/tags/{id}`          | Delete all tags         | 
| POST   | `/api/v1/tags`               | Create a new tag        |
| GET    | `/api/v1/category`           | Get all categories      |
| DELETE | `/api/v1/category`           | Delete all categories   | 
| POST   | `/api/v1/category`           | Create a new category   |
| PUT    | `/api/v1/category/{id}`      | Update a category       |
| POST   | `/api/v1/auth/login`         | Obtain a JWT token      |
| POST   | `/api/v1/auth/signin`        | Create a new user       |



All endpoints can be extended with an `/id` parameter to perform operations on a specific object.

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

## 🔒 Spring Security Configuration

The application uses **Spring Security** to secure API endpoints and manage authentication and authorization. Below is an overview of the security setup:

### 🔑 Authentication

- **JWT (JSON Web Token)**: The application uses JWT for stateless authentication. A valid token must be included in the `Authorization` header for protected endpoints:
  ```
  Authorization: Bearer <your-token>
  ```
- A default user is created during application startup:
  - **Email**: `user@gmail.com`
  - **Password**: `1234`

### 🛡️ Authorization

- Public endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/signin`
  - `GET /api/v1/categories/**`
  - `GET /api/v1/posts/**`
  - `GET /api/v1/tags/**`
- Protected endpoints (require authentication):
  - `GET /api/v1/posts/drafts`
  - Any other endpoints not explicitly listed as public.

### 🔧 Custom Security Configuration

The security configuration is defined in the `SecurityConfig` class. Key components include:
- **JWT Authentication Filter**: Validates JWT tokens for protected endpoints.
- **Password Encoding**: Uses `BCryptPasswordEncoder` to securely hash passwords.
- **Stateless Sessions**: Configured to use stateless session management (`SessionCreationPolicy.STATELESS`).

### 🧪 Testing Authentication

To test authentication:
1. Obtain a JWT token by sending a `POST` request to `/api/v1/auth/login` with valid credentials:
   ```json
   {
     "email": "user@gmail.com",
     "password": "1234"
   }
   ```
2. Use the returned token to access protected endpoints by including it in the `Authorization` header:
   ```
   Authorization: Bearer <your-token>
   ```

For more details, refer to the `SecurityConfig` class in the source code.
