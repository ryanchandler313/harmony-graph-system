# HarmonyGraph

A powerful data mapping and visualization platform that connects SQL Server databases to Neo4j graph databases. Transform your relational data into meaningful graph relationships and explore them with intuitive visualizations.

## Features

- 🔐 **Secure Authentication**: Password-protected access with user registration and login
- 🔗 **SQL Server Integration**: Connect to multiple SQL Server data sources
- 🎯 **Visual Data Mapping**: Map SQL columns to Neo4j nodes and properties
- 📊 **Graph Visualization**: Interactive graph visualization with vis-network
- 🔍 **Cypher Queries**: Execute Cypher queries with real-time results
- 💾 **Secure Storage**: All credentials and mappings stored in Neo4j graph

## Architecture

- **Backend**: Node.js + Express + Neo4j Driver + SQL Server driver
- **Frontend**: React + TypeScript + React Router + Vis.js
- **Database**: Neo4j (local, no authentication required)

## Prerequisites

- Node.js 16+
- Neo4j database running locally on bolt://localhost:7687
- SQL Server instance (for data sources)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HarmonyGraph
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create backend environment file:
```bash
cd ../backend
cp .env.example .env
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

2. Start the frontend development server:
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

3. Open your browser to http://localhost:3000

## Usage

### 1. Authentication
- Register a new account or login with existing credentials
- All user data is securely stored in the Neo4j graph

### 2. Connect Data Sources
- Navigate to the "Data Sources" page
- Add your SQL Server connection details
- Credentials are encrypted and stored in Neo4j

### 3. Create Mappings
- Go to the "Mapping" page
- Select a data source to explore its schema
- Click on columns to map them to Neo4j node properties
- Define node labels and property names

### 4. Visualize Data
- Visit the "Graph" page
- Execute Cypher queries to explore your data
- View results in an interactive graph visualization
- Use sample queries to get started

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Data Sources
- `GET /api/datasources` - List user's data sources
- `POST /api/datasources` - Add new data source
- `GET /api/datasources/:id/schema` - Get database schema

### Mappings
- `GET /api/mappings/:datasourceId` - Get mappings for data source
- `POST /api/mappings` - Create new mapping

### Queries
- `POST /api/cypher` - Execute Cypher query

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection protection
- Encrypted credential storage
- CORS protection

## Development

The application uses:
- TypeScript for type safety
- Axios for HTTP requests
- Vis.js for graph visualization
- Express.js for API server
- Neo4j driver for graph database
- MSSQL driver for SQL Server

## Configuration

Backend environment variables (`.env`):
```
PORT=5000
JWT_SECRET=your-secret-key
NEO4J_URI=bolt://localhost:7687
```

## Troubleshooting

1. **Neo4j Connection Issues**: Ensure Neo4j is running on bolt://localhost:7687
2. **SQL Server Connection**: Verify server address, credentials, and network connectivity
3. **CORS Issues**: Check that backend CORS is configured for frontend URL
4. **Authentication Errors**: Verify JWT secret consistency between requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details