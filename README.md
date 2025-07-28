# HarmonyGraph - Development Documentation

A comprehensive data mapping and visualization platform that connects SQL Server databases to Neo4j graph databases. Transform relational data into meaningful graph relationships with an intuitive React frontend.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Database Configuration](#database-configuration)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## Overview

HarmonyGraph enables users to:
- Connect to SQL Server databases and explore schemas
- Visually map SQL columns to Neo4j node properties
- Execute Cypher queries with real-time graph visualization
- Manage multiple data sources with secure credential storage

### Key Features
- 🔐 JWT-based authentication with bcrypt password hashing
- 🔗 Multiple SQL Server data source management
- 🎯 Interactive visual mapping interface
- 📊 Real-time graph visualization with vis-network
- 🔍 Cypher query execution with result visualization
- 💾 All data stored securely in Neo4j graph database

## Architecture

### Technology Stack
- **Backend**: Node.js 18+, Express.js, Neo4j Driver, MSSQL Driver
- **Frontend**: React 18+ with TypeScript, React Router, Axios, Vis-Network
- **Databases**: Neo4j 5.x (metadata storage), SQL Server 2019+ (data sources)
- **Authentication**: JWT tokens with bcrypt password hashing

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│◄──►│  Express Backend │◄──►│   Neo4j Graph   │
│   (Port 4455)  │    │   (Port 2233)    │    │   (Port 7687)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SQL Server    │
                       │   (Port 1433)   │
                       └─────────────────┘
```

## Development Setup

### Prerequisites
- **Node.js**: Version 18 or higher
- **Docker**: For running SQL Server and Neo4j
- **Git**: For version control
- **Package Manager**: npm (comes with Node.js)

### 1. Clone and Install
```bash
# Clone repository
git clone https://github.com/ryanchandler313/harmony-graph-system.git
cd harmony-graph-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../backend/frontend
npm install
```

### 2. Environment Configuration
Create `.env` file in backend directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
PORT=2233
JWT_SECRET=harmony-graph-secret-key-2024
NEO4J_URI=bolt://localhost:7687
```

### 3. Start Development Servers
```bash
# Terminal 1: Start backend (from backend directory)
npm start
# Runs on http://localhost:2233

# Terminal 2: Start frontend (from backend/frontend directory)  
PORT=4455 npm start
# Runs on http://localhost:4455
```

## Database Configuration

### Neo4j Setup
```bash
# Using Docker (recommended)
docker run \
  --name neo4j-instance \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  -d neo4j:5.15-community

# Or using Homebrew on macOS
brew install neo4j
neo4j-admin dbms set-initial-password password123
neo4j start
```

**Neo4j Credentials:**
- Username: `neo4j`
- Password: `password123`
- Bolt URL: `bolt://localhost:7687`
- Browser: `http://localhost:7474`

### SQL Server Setup
```bash
# Using Docker
docker run \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=sqlf@m1ly" \
  -e "MSSQL_PID=Developer" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2019-latest

# Create sqlfamily user
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "sqlf@m1ly" -C \
  -Q "CREATE LOGIN sqlfamily WITH PASSWORD = 'sqlf@m1ly'; ALTER SERVER ROLE sysadmin ADD MEMBER sqlfamily;"
```

### AdventureWorks Sample Database
```bash
# Download and restore AdventureWorks
curl -L -o /tmp/AdventureWorks2019.bak \
  "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2019.bak"

docker cp /tmp/AdventureWorks2019.bak sqlserver:/var/opt/mssql/data/

docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sqlfamily -P "sqlf@m1ly" -C \
  -Q "RESTORE DATABASE AdventureWorks2019 FROM DISK='/var/opt/mssql/data/AdventureWorks2019.bak' WITH MOVE 'AdventureWorks2019' TO '/var/opt/mssql/data/AdventureWorks2019.mdf', MOVE 'AdventureWorks2019_log' TO '/var/opt/mssql/data/AdventureWorks2019.ldf', REPLACE"
```

**SQL Server Test Credentials:**
- Server: `localhost`
- Database: `AdventureWorks2019`
- Username: `sqlfamily`
- Password: `sqlf@m1ly`

## Project Structure

```
harmony-graph-system/
├── backend/
│   ├── frontend/                 # React app (created by create-react-app)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Welcome.tsx
│   │   │   │   ├── DataSources.tsx
│   │   │   │   ├── Mapping.tsx
│   │   │   │   └── GraphVisualization.tsx
│   │   │   ├── App.tsx          # Main app component
│   │   │   ├── App.css          # Global styles
│   │   │   └── index.tsx        # Entry point
│   │   └── package.json
│   ├── node_modules/
│   ├── .env                     # Environment variables
│   ├── server.js               # Express server
│   └── package.json
├── frontend/                    # Legacy directory (unused)
├── .gitignore
└── README.md
```

### Key Files Explained

**Backend (`backend/server.js`)**
- Express.js server with middleware for CORS, JSON parsing, JWT auth
- Neo4j connection with basic authentication
- REST API endpoints for auth, datasources, mappings, and Cypher queries
- SQL Server connection handling with encrypted credentials

**Frontend (`backend/frontend/src/`)**
- **App.tsx**: Main application with routing and authentication state
- **Login.tsx**: User registration and login interface
- **Welcome.tsx**: Dashboard with getting started guide
- **DataSources.tsx**: SQL Server connection management
- **Mapping.tsx**: Visual schema mapping interface
- **GraphVisualization.tsx**: Cypher query execution and graph display

## API Documentation

### Authentication Endpoints

#### POST `/api/register`
Register a new user account.
```json
Request:
{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "1753646802560",
    "username": "testuser"
  }
}
```

#### POST `/api/login`
Authenticate existing user.
```json
Request:
{
  "username": "testuser", 
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "1753646802560",
    "username": "testuser"
  }
}
```

### Data Source Endpoints

#### GET `/api/datasources`
List all data sources for authenticated user.
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
[
  {
    "id": "1753649259208",
    "name": "AdventureWorks 2019",
    "server": "localhost",
    "database": "AdventureWorks2019",
    "username": "sqlfamily"
  }
]
```

#### POST `/api/datasources`
Add new SQL Server data source.
```json
Headers: { "Authorization": "Bearer jwt_token" }
Request:
{
  "name": "My Database",
  "server": "localhost",
  "database": "AdventureWorks2019", 
  "username": "sqlfamily",
  "password": "sqlf@m1ly"
}

Response:
{
  "id": "1753649259208",
  "name": "My Database",
  "server": "localhost",
  "database": "AdventureWorks2019",
  "username": "sqlfamily"
}
```

#### GET `/api/datasources/:id/schema`
Retrieve database schema for data source.
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
{
  "Person": [
    {
      "name": "PersonID",
      "type": "int",
      "nullable": false
    },
    {
      "name": "FirstName",
      "type": "nvarchar", 
      "nullable": false
    }
  ],
  "Address": [...]
}
```

### Mapping Endpoints

#### POST `/api/mappings`
Create column-to-node mapping.
```json
Headers: { "Authorization": "Bearer jwt_token" }
Request:
{
  "datasourceId": "1753649259208",
  "tableName": "Person",
  "columnName": "FirstName", 
  "nodeLabel": "Person",
  "propertyName": "firstName"
}

Response:
{
  "id": "1753649500123",
  "datasourceId": "1753649259208",
  "tableName": "Person",
  "columnName": "FirstName",
  "nodeLabel": "Person", 
  "propertyName": "firstName"
}
```

#### GET `/api/mappings/:datasourceId`
Get all mappings for a data source.
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
[
  {
    "id": "1753649500123",
    "datasourceId": "1753649259208", 
    "tableName": "Person",
    "columnName": "FirstName",
    "nodeLabel": "Person",
    "propertyName": "firstName"
  }
]
```

### Query Endpoints

#### POST `/api/cypher`
Execute Cypher query against Neo4j.
```json
Headers: { "Authorization": "Bearer jwt_token" }
Request:
{
  "query": "MATCH (n) RETURN n LIMIT 10"
}

Response:
{
  "data": [
    {
      "n": {
        "identity": "123",
        "labels": ["User"],
        "properties": {
          "username": "testuser",
          "id": "1753646802560"
        }
      }
    }
  ],
  "summary": {...}
}
```

## Frontend Components

### Authentication Flow
1. **App.tsx** checks for stored JWT token on load
2. If no token, renders **Login.tsx** component
3. **Login.tsx** handles registration/login and calls backend API
4. On success, token stored in localStorage and user state updated
5. **App.tsx** then renders main application with navigation

### Component Architecture
```
App.tsx (Route management + Auth state)
├── Login.tsx (Not authenticated)
└── Authenticated Routes:
    ├── Welcome.tsx (Dashboard)
    ├── DataSources.tsx (SQL Server management)
    ├── Mapping.tsx (Schema mapping)
    └── GraphVisualization.tsx (Query + Visualization)
```

### Key Component Details

**DataSources.tsx**
- Lists existing SQL Server connections
- Form to add new connections with validation
- Tests connection by calling schema endpoint

**Mapping.tsx**
- Dropdown to select data source
- Two-panel layout: schema tree (left) + mapping form (right)
- Click column to select, enter node label/property, create mapping
- Displays existing mappings below form

**GraphVisualization.tsx**
- Text area for Cypher query input
- Sample query buttons for quick testing
- Vis-network graph visualization of query results
- Table display of raw query results
- Handles nodes, relationships, and primitive values

### Styling Approach
- **Global CSS** in `App.css` with CSS variables for theming
- **Glass morphism design** with backdrop filters and transparency
- **Responsive grid layouts** for different screen sizes
- **Consistent color palette** with purple/blue gradient theme

## Development Workflow

### Making Changes

1. **Backend API Changes**
   ```bash
   # Edit backend/server.js
   # Restart backend server (Ctrl+C, npm start)
   # Test with curl or Postman
   ```

2. **Frontend Changes**
   ```bash
   # Edit files in backend/frontend/src/
   # Hot reload automatically updates browser
   # Check browser console for errors
   ```

3. **Database Schema Changes**
   ```bash
   # Connect to Neo4j browser: http://localhost:7474
   # Run Cypher commands to inspect/modify data
   # Or use backend Cypher endpoint via frontend
   ```

### Testing Workflow

1. **Test Authentication**
   ```bash
   curl -X POST http://localhost:2233/api/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"pass123"}'
   ```

2. **Test Data Source Connection**
   ```bash
   curl -X POST http://localhost:2233/api/datasources \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","server":"localhost","database":"AdventureWorks2019","username":"sqlfamily","password":"sqlf@m1ly"}'
   ```

3. **Test Schema Discovery**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:2233/api/datasources/DATASOURCE_ID/schema
   ```

### Common Development Tasks

#### Adding New API Endpoint
1. Add route handler in `backend/server.js`
2. Add authentication middleware if needed
3. Implement Neo4j/SQL Server logic
4. Add error handling and validation
5. Test with curl/Postman
6. Update frontend to call new endpoint

#### Adding New Frontend Component
1. Create `.tsx` file in `backend/frontend/src/components/`
2. Define TypeScript interfaces for props
3. Add component to routing in `App.tsx`
4. Style with existing CSS classes
5. Add navigation link if needed

#### Modifying Database Schema
1. Update Cypher queries in backend
2. Test schema changes in Neo4j browser
3. Update frontend TypeScript interfaces
4. Handle migration of existing data if needed

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if ports are in use
lsof -i :2233
lsof -i :7687
lsof -i :1433

# Check Neo4j connection
docker ps | grep neo4j
curl http://localhost:7474

# Check backend logs
cd backend && npm start
```

#### Frontend Authentication Issues
- Clear localStorage: `localStorage.clear()` in browser console
- Check JWT token expiration
- Verify backend CORS settings
- Check network tab for 401/403 errors

#### SQL Server Connection Failures
```bash
# Test Docker container
docker ps | grep sqlserver
docker logs sqlserver

# Test connection
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sqlfamily -P "sqlf@m1ly" -C \
  -Q "SELECT @@VERSION"
```

#### Schema Discovery Returns Empty
- Verify SQL Server user permissions
- Check database name spelling
- Ensure table permissions for user
- Test with SQL Server Management Studio

#### Graph Visualization Not Loading
- Check browser console for JavaScript errors
- Verify vis-network imports
- Test with simple Cypher query: `RETURN 1`
- Check if query returns valid node/relationship data

### Debug Tools

#### Neo4j Browser Queries
```cypher
// List all users
MATCH (u:User) RETURN u

// List all data sources
MATCH (ds:DataSource) RETURN ds

// List all mappings
MATCH (m:Mapping) RETURN m

// Clear all data (BE CAREFUL!)
MATCH (n) DETACH DELETE n
```

#### SQL Server Test Queries
```sql
-- Test connection
SELECT @@VERSION

-- List databases
SELECT name FROM sys.databases

-- List tables in AdventureWorks
USE AdventureWorks2019
SELECT TABLE_SCHEMA, TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME
```

## Deployment

### Production Environment Setup

#### Environment Variables
```env
NODE_ENV=production
PORT=2233
JWT_SECRET=secure-random-secret-key-production
NEO4J_URI=bolt://neo4j-server:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=production-password
```

#### Docker Compose Deployment
```yaml
version: '3.8'
services:
  neo4j:
    image: neo4j:5.15-community
    environment:
      NEO4J_AUTH: neo4j/production-password
    ports:
      - "7687:7687"
      - "7474:7474"
    volumes:
      - neo4j-data:/data

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      ACCEPT_EULA: Y
      MSSQL_SA_PASSWORD: ProductionPassword123!
    ports:
      - "1433:1433"

  harmony-backend:
    build: ./backend
    environment:
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_USER: neo4j
      NEO4J_PASSWORD: production-password
    ports:
      - "2233:2233"
    depends_on:
      - neo4j
      - sqlserver

volumes:
  neo4j-data:
```

#### Build and Deploy
```bash
# Build frontend for production
cd backend/frontend
npm run build

# Start production services
docker-compose up -d

# Monitor logs
docker-compose logs -f harmony-backend
```

### Security Considerations

1. **Change Default Passwords**: Update all default credentials
2. **Use HTTPS**: Configure SSL/TLS certificates
3. **Environment Variables**: Store secrets in secure env files
4. **Network Security**: Restrict database access to application only
5. **Input Validation**: Sanitize all user inputs
6. **Rate Limiting**: Add API rate limiting middleware
7. **SQL Injection**: Use parameterized queries (already implemented)
8. **CORS Configuration**: Restrict origins to trusted domains

### Performance Optimization

1. **Connection Pooling**: Implement SQL Server connection pooling
2. **Caching**: Add Redis for session/query caching  
3. **Index Neo4j**: Create indexes on frequently queried properties
4. **Pagination**: Add pagination for large result sets
5. **Compression**: Enable gzip compression
6. **CDN**: Use CDN for static assets

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use meaningful variable and function names
3. Add error handling for all async operations
4. Validate user inputs on both frontend and backend
5. Write unit tests for critical functions
6. Document complex business logic
7. Use consistent code formatting (Prettier)

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-functionality

# Make changes and commit
git add .
git commit -m "Add new functionality for X"

# Push and create PR
git push origin feature/new-functionality
```

### Code Review Checklist
- [ ] Security: No hardcoded secrets, proper input validation
- [ ] Error Handling: Graceful error handling with user feedback
- [ ] Performance: No obvious performance bottlenecks
- [ ] Testing: Critical paths are tested
- [ ] Documentation: Complex logic is documented
- [ ] TypeScript: Proper typing, no `any` types
- [ ] Accessibility: UI components are accessible

---

This documentation provides a comprehensive foundation for continuing development of HarmonyGraph. For specific implementation details, refer to the code comments and inline documentation.