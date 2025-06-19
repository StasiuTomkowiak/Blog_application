# Blog Application – Full Stack

This is a full-stack blog application with a Spring Boot backend API and React frontend. It provides a complete blogging platform with user authentication, content management, and responsive design. Data is stored in a PostgreSQL database and uses HashiCorp Vault for secure configuration management.

## Technologies

**Backend:**
- **Java 21**: Programming language
- **Spring Boot**: Framework for backend development
- **Spring Security**: Secure API endpoints
- **Spring Data JPA**: For database interaction
- **PostgreSQL**: Relational database
- **Maven**: Dependency management and build tool
- **Docker & Docker Compose**: For containerized database setup
- **HashiCorp Vault**: Secure secrets management

**Frontend:**
- **React 18**: Component-based UI library
- **Vanilla JavaScript**: No build process required
- **CSS3**: Modern styling with dark theme
- **HTML5**: Semantic markup
- **Responsive Design**: Mobile-first approach

## Project Structure

```
Blog_application/
├── blog/                                   # Backend Spring Boot application
│   ├── src/
│   │    ├── main/
│   │    │   ├── java/com/stasiu/blog/      # Core application logic
│   │    │   └── resources/                 # Configuration files
│   │    └── test/java/com/stasiu/blog/     # Unit tests
│   ├── pom.xml                             # Maven configuration
│   ├── docker-compose.yml                  # PostgreSQL & Vault setup
│   └── .env                                # Environment variables (create this)
├── frontend-api/                           # Frontend React application
│   └── src/
│       ├── components/                     # React components
│       ├── views/                          # Page components
│       ├── services/                       # API integration
│       ├── styles/                         # CSS styling
│       └── main.html                       # Application entry point
└── README.md                               # Project documentation
```

## Getting Started

### Prerequisites

- Java 21+
- Maven
- Docker

### 1. Clone the Repository

```bash
git clone https://github.com/StasiuTomkowiak/Blog_application
cd Blog_application/blog
```

### 2. Environment Configuration

Create a `.env` file in the `blog/` directory with the following variables:

```env
# Database Configuration
DB_PASSWORD=your_postgres_password

# Vault Configuration
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your_vault_token
```

**Important**: Replace the placeholder values with your actual credentials.

### 3. Start Services with Docker

If PostgreSQL and Vault are not installed locally, use Docker:

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **Adminer** (database admin interface) on port `8888` 
- **HashiCorp Vault** on port `8200`

### 4. Configure HashiCorp Vault

Once Vault is running, you need to initialize and configure it:

#### a) Initialize Vault (first time only)
```bash
# Set environment variables
export VAULT_ADDR=http://localhost:8200

# Initialize Vault
docker exec vault vault operator init

# Note down the unseal keys and root token from the output
```

#### b) Unseal Vault
```bash
# Use 3 of the 5 unseal keys from the init output
docker exec vault vault operator unseal <unseal_key_1>
docker exec vault vault operator unseal <unseal_key_2>
docker exec vault vault operator unseal <unseal_key_3>
```

#### c) Store Secrets in Vault
```bash
# Login with root token
docker exec vault vault auth <root_token>

# Create secrets for the blog application
docker exec vault vault kv put secret/blog jwt.secret=your_jwt_secret_key_here
```

Update your `.env` file with the root token:
```env
VAULT_TOKEN=<your_root_token>
```

### 5. Run the Spring Boot Application

With Vault configured and environment variables set:

```bash
VAULT_TOKEN=$VAULT_TOKEN ./mvnw spring-boot:run
```

Or on Windows:
```cmd
set VAULT_TOKEN=%VAULT_TOKEN% && mvnw.cmd spring-boot:run
```

The application will start on `http://localhost:8080`.

### 6. Run the Frontend Application

In a separate terminal, navigate to the frontend directory and serve the application:

```bash
cd ../frontend-api/src
```

#### Option 1: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `main.html`
3. Select "Open with Live Server"

#### Option 2: Using Python
```bash
python -m http.server 5500
```

#### Option 3: Using Node.js
```bash
npx http-server -p 5500
```

The frontend will be available at `http://localhost:5500` or `http://127.0.0.1:5500`.

## Running Tests

Run unit tests for the backend:

```bash
./mvnw test
```

## Sample API Endpoints

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

## Configuration

### Database Configuration
Database configuration is located in:
```
src/main/resources/application.properties
```

Example:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
```

### Vault Configuration
The application uses HashiCorp Vault to manage sensitive configuration like JWT secrets:

```properties
spring.cloud.vault.enabled=true
spring.cloud.vault.uri=http://localhost:8200
spring.cloud.vault.authentication=token
spring.cloud.vault.token=${VAULT_TOKEN}
spring.cloud.vault.kv.enabled=true
spring.cloud.vault.kv.default-context=blog
spring.cloud.vault.kv.backend=secret
```

### Environment Variables
Create a `.env` file with these required variables:
- `DB_PASSWORD`: PostgreSQL database password
- `VAULT_TOKEN`: HashiCorp Vault authentication token
- `VAULT_ADDR`: Vault server address (default: http://localhost:8200)

## HashiCorp Vault Setup

### Why Vault?
HashiCorp Vault provides secure, centralized secrets management for:
- JWT signing keys
- Database passwords
- API keys
- Other sensitive configuration

### Vault Services
The `docker-compose.yml` includes:
- **Vault Server**: Secure secrets storage
- **File Backend**: Local development storage
- **Token Authentication**: Simple auth method for development

### Production Considerations
For production environments:
- Use proper Vault backends (Consul, etcd)
- Implement proper authentication methods (AppRole, Kubernetes, etc.)
- Enable Vault audit logging
- Use TLS/SSL encryption
- Implement proper backup strategies

## Spring Security Configuration

The application uses **Spring Security** to secure API endpoints and manage authentication and authorization. Below is an overview of the security setup:

### Authentication

- **JWT (JSON Web Token)**: The application uses JWT for stateless authentication. A valid token must be included in the `Authorization` header for protected endpoints:
  ```
  Authorization: Bearer <your-token>
  ```

### Authorization

- Public endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/signin`
  - `GET /api/v1/categories/**`
  - `GET /api/v1/posts/**`
  - `GET /api/v1/tags/**`
- Protected endpoints (require authentication):
  - `GET /api/v1/posts/drafts`
  - Any other endpoints not explicitly listed as public.

### Custom Security Configuration

The security configuration is defined in the `SecurityConfig` class. Key components include:
- **JWT Authentication Filter**: Validates JWT tokens for protected endpoints.
- **Password Encoding**: Uses `BCryptPasswordEncoder` to securely hash passwords.
- **Stateless Sessions**: Configured to use stateless session management (`SessionCreationPolicy.STATELESS`).

## Docker Services

The `docker-compose.yml` file provides:

- **PostgreSQL Database**: Main application database
- **Adminer**: Web-based database administration tool
- **HashiCorp Vault**: Secrets management server

Access URLs:
- Database: `localhost:5432`
- Adminer: `http://localhost:8888`
- Vault UI: `http://localhost:8200`

## Frontend Application

The project includes a modern, responsive frontend built with vanilla JavaScript and React. The frontend provides a complete user interface for the blog application.

### Frontend Technologies

- **React 18**: Component-based UI library
- **Vanilla JavaScript**: No build process required
- **CSS3**: Modern styling with dark theme
- **Responsive Design**: Mobile-first approach
- **Local Storage**: JWT token management

### Frontend Features

- **Home Page**: Welcome page with recent posts and categories
- **Posts Management**: Browse, read, and manage blog posts
- **Categories & Tags**: Organize and filter content
- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Admin panel for content management (authenticated users)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark UI design

### Frontend Structure

```
frontend-api/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── contexts/            # React contexts
│   ├── services/            # API service layer
│   ├── styles/              # CSS styles
│   ├── views/               # Page components
│   ├── App.js               # Main application component
│   ├── index.js             # Application entry point
│   └── main.html            # HTML entry point
```

### Running the Frontend

The frontend is a static application that can be served by any web server:

#### Option 1: Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `frontend-api/src/main.html`
3. Select "Open with Live Server"
4. Access at `http://localhost:5500` or `http://127.0.0.1:5500`

#### Option 2: Python HTTP Server
```bash
cd frontend-api/src
python -m http.server 5500
```

#### Option 3: Node.js HTTP Server
```bash
cd frontend-api/src
npx http-server -p 5500
```

### Frontend Configuration

The frontend is configured to connect to the backend API:

```javascript
// In src/services/ApiService.js
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

Make sure the backend is running on `http://localhost:8080` before using the frontend.

### User Authentication

The frontend includes a complete authentication system:

- **Login/Register**: User authentication with form validation
- **JWT Token Management**: Automatic token storage and inclusion in requests
- **Protected Routes**: Dashboard requires authentication

### Frontend Views

1. **Home View**: Landing page with recent posts and categories
2. **Posts View**: Browse all published posts with category filtering
3. **Post Detail View**: Read individual posts with full content
4. **Categories View**: Manage blog categories (admin feature)
5. **Tags View**: Manage blog tags (admin feature)
6. **Dashboard View**: Content management for authenticated users
7. **Login View**: Authentication interface

### Mobile Responsiveness

The frontend is fully responsive with:
- **Mobile Navigation**: Hamburger menu for small screens
- **Flexible Grid Layouts**: Automatically adapt to screen size
- **Touch-Friendly**: Optimized for touch interactions
- **Readable Typography**: Proper font sizes for all devices

### API Integration

The frontend communicates with the backend through a centralized API service:

```javascript
// Example API calls
await ApiService.get('/posts');              // Get all posts
await ApiService.post('/posts', postData);   // Create new post
await ApiService.put('/posts/123', postData); // Update post
await ApiService.delete('/posts/123');       // Delete post
```

### Error Handling

Comprehensive error handling includes:
- **Network Errors**: Connection issues with the backend
- **Authentication Errors**: Automatic redirect to login
- **Validation Errors**: Form validation feedback
- **User-Friendly Messages**: Clear error descriptions

### Development Features

- **No Build Process**: Direct browser execution
- **Hot Reload**: Changes reflect immediately (with Live Server)
- **Error Boundaries**: Graceful error handling
- **Component Architecture**: Modular, reusable components

## Troubleshooting

### Common Issues

1. **Vault Connection Failed**
   - Ensure Vault is running: `docker ps`
   - Check Vault status: `docker exec vault vault status`
   - Verify VAULT_TOKEN is set correctly

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DB_PASSWORD in .env file
   - Ensure database exists

3. **JWT Token Issues**
   - Verify jwt.secret is stored in Vault
   - Check Vault connectivity
   - Ensure proper token format

4. **Frontend API Connection Issues**
   - Ensure backend is running on `http://localhost:8080`
   - Check CORS configuration in backend
   - Verify API endpoints are accessible
   - Check browser console for error messages

