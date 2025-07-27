const express = require('express');
const neo4j = require('neo4j-driver');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password123'));

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const session = driver.session();
  
  try {
    const result = await session.run(
      'MATCH (u:User {username: $username}) RETURN u',
      { username }
    );
    
    if (result.records.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.records[0].get('u').properties;
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.close();
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  const session = driver.session();
  
  try {
    const existingUser = await session.run(
      'MATCH (u:User {username: $username}) RETURN u',
      { username }
    );
    
    if (existingUser.records.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    await session.run(
      'CREATE (u:User {id: $id, username: $username, password: $password})',
      { id: userId, username, password: hashedPassword }
    );
    
    const token = jwt.sign({ id: userId, username }, JWT_SECRET);
    res.json({ token, user: { id: userId, username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    session.close();
  }
});

app.post('/api/datasources', authMiddleware, async (req, res) => {
  const { name, server, database, username, password } = req.body;
  
  const session = driver.session();
  
  try {
    const datasourceId = Date.now().toString();
    
    await session.run(
      'CREATE (ds:DataSource {id: $id, name: $name, server: $server, database: $database, username: $username, password: $password, userId: $userId})',
      { id: datasourceId, name, server, database, username, password, userId: req.user.id }
    );
    
    res.json({ id: datasourceId, name, server, database, username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.close();
  }
});

app.get('/api/datasources', authMiddleware, async (req, res) => {
  const session = driver.session();
  
  try {
    const result = await session.run(
      'MATCH (ds:DataSource {userId: $userId}) RETURN ds',
      { userId: req.user.id }
    );
    
    const datasources = result.records.map(record => {
      const ds = record.get('ds').properties;
      return {
        id: ds.id,
        name: ds.name,
        server: ds.server,
        database: ds.database,
        username: ds.username
      };
    });
    
    res.json(datasources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.close();
  }
});

app.get('/api/datasources/:id/schema', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const session = driver.session();
  
  try {
    const result = await session.run(
      'MATCH (ds:DataSource {id: $id, userId: $userId}) RETURN ds',
      { id, userId: req.user.id }
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    
    const ds = result.records[0].get('ds').properties;
    
    const config = {
      user: ds.username,
      password: ds.password,
      server: ds.server,
      database: ds.database,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    };
    
    const pool = await sql.connect(config);
    const schemaResult = await pool.request().query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    
    const schema = {};
    schemaResult.recordset.forEach(row => {
      if (!schema[row.TABLE_NAME]) {
        schema[row.TABLE_NAME] = [];
      }
      schema[row.TABLE_NAME].push({
        name: row.COLUMN_NAME,
        type: row.DATA_TYPE,
        nullable: row.IS_NULLABLE === 'YES'
      });
    });
    
    await pool.close();
    res.json(schema);
  } catch (error) {
    res.status(500).json({ message: 'Database connection error' });
  } finally {
    session.close();
  }
});

app.post('/api/mappings', authMiddleware, async (req, res) => {
  const { datasourceId, tableName, columnName, nodeLabel, propertyName } = req.body;
  
  const session = driver.session();
  
  try {
    const mappingId = Date.now().toString();
    
    await session.run(
      'CREATE (m:Mapping {id: $id, datasourceId: $datasourceId, tableName: $tableName, columnName: $columnName, nodeLabel: $nodeLabel, propertyName: $propertyName, userId: $userId})',
      { id: mappingId, datasourceId, tableName, columnName, nodeLabel, propertyName, userId: req.user.id }
    );
    
    res.json({ id: mappingId, datasourceId, tableName, columnName, nodeLabel, propertyName });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.close();
  }
});

app.get('/api/mappings/:datasourceId', authMiddleware, async (req, res) => {
  const { datasourceId } = req.params;
  const session = driver.session();
  
  try {
    const result = await session.run(
      'MATCH (m:Mapping {datasourceId: $datasourceId, userId: $userId}) RETURN m',
      { datasourceId, userId: req.user.id }
    );
    
    const mappings = result.records.map(record => record.get('m').properties);
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.close();
  }
});

app.post('/api/cypher', authMiddleware, async (req, res) => {
  const { query } = req.body;
  const session = driver.session();
  
  try {
    const result = await session.run(query);
    
    const data = result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        const value = record.get(key);
        if (value && typeof value === 'object' && value.constructor.name === 'Node') {
          obj[key] = {
            identity: value.identity.toString(),
            labels: value.labels,
            properties: value.properties
          };
        } else if (value && typeof value === 'object' && value.constructor.name === 'Relationship') {
          obj[key] = {
            identity: value.identity.toString(),
            type: value.type,
            properties: value.properties,
            start: value.start.toString(),
            end: value.end.toString()
          };
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });
    
    res.json({ data, summary: result.summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    session.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('exit', () => {
  driver.close();
});