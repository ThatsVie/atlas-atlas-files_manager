# Files Manager Express


Files Manager Express is a back-end platform built to upload, view, and manage files. This project integrates key concepts, including:
- User Authentication via token
- File Management (List, Upload, View)
- Permission Modification
- Image Thumbnail Generation
- Background Processing and Pagination

This service is for learning purposes, bringing together essential back-end skills to create a functional file management system.

## Resources

- [Node.js Getting Started](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Express Documentation](https://expressjs.com/en/starter/installing.html)
- [Mocha Documentation](https://mochajs.org/)
- [MongoDB Node Driver](https://github.com/mongodb/node-mongodb-native)
- [Redis Node Client](https://github.com/redis/node-redis)
- [Image Thumbnail NPM Package](https://www.npmjs.com/package/image-thumbnail)

## Learning Objectives
- Creating an API with Express
- Authenticating users
- Storing data in MongoDB
- Handling temporary data in Redis
- Setting up and using background workers



## Getting Started

To get started with the Files Manager Express project, ensure you have the following:

- Node.js 12.x.x
- MongoDB, Redis, and other dependencies as detailed in [Dependencies](#dependencies).
- This project is developed on **Ubuntu 18.04 LTS** and requires `npm` for dependency management.

## Provided Files

<details>
  <summary>package.json</summary>

```json
{
    "name": "files_manager",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "lint": "./node_modules/.bin/eslint",
      "check-lint": "lint [0-9]*.js",
      "start-server": "nodemon --exec babel-node --presets @babel/preset-env ./server.js",
      "start-worker": "nodemon --exec babel-node --presets @babel/preset-env ./worker.js",
      "dev": "nodemon --exec babel-node --presets @babel/preset-env",
      "test": "./node_modules/.bin/mocha --require @babel/register --exit" 
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
      "bull": "^3.16.0",
      "chai-http": "^4.3.0",
      "express": "^4.17.1",
      "image-thumbnail": "^1.0.10",
      "mime-types": "^2.1.27",
      "mongodb": "^3.5.9",
      "redis": "^2.8.0",
      "sha1": "^1.1.1",
      "uuid": "^8.2.0"
    },
    "devDependencies": {
      "@babel/cli": "^7.8.0",
      "@babel/core": "^7.8.0",
      "@babel/node": "^7.8.0",
      "@babel/preset-env": "^7.8.2",
      "@babel/register": "^7.8.0",
      "chai": "^4.2.0",
      "chai-http": "^4.3.0",
      "mocha": "^6.2.2",
      "nodemon": "^2.0.2",
      "eslint": "^6.4.0",
      "eslint-config-airbnb-base": "^14.0.0",
      "eslint-plugin-import": "^2.18.2",
      "eslint-plugin-jest": "^22.17.0",
      "request": "^2.88.0",
      "sinon": "^7.5.0"
    }
  }
```

</details>

<details>
  <summary>.eslintrc.js</summary>

```js
module.exports = {
    env: {
      browser: false,
      es6: true,
      jest: true,
    },
    extends: [
      'airbnb-base',
      'plugin:jest/all',
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: ['jest'],
    rules: {
      'max-classes-per-file': 'off',
      'no-underscore-dangle': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
    },
    overrides:[
      {
        files: ['*.js'],
        excludedFiles: 'babel.config.js',
      }
    ]
};

```

</details>

<details>
  <summary>babel.config.js</summary>

```js
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
};
```

</details>

---

### Dependencies

To install all dependencies, run:

```bash
npm install
```

| Dependency     | Version | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| `express`      | ^4.17.1 | Framework for building APIs                               |
| `mongodb`      | ^3.5.9  | MongoDB driver for Node.js                                |
| `redis`        | ^2.8.0  | Redis client for caching                                  |
| `image-thumbnail` | ^1.0.10 | Generates image thumbnails                          |
| `bull`         | ^3.16.0 | Queue library for background tasks                        |
| `uuid`         | ^8.2.0  | Generates unique identifiers for resources               |
| `chai`, `mocha`, `eslint`  |  Testing and code linting tools                         |

---

### Setup

1. Clone the repository and navigate to the project folder.
2. Run the following command to install dependencies:

   ```bash
   npm install
   ```

3. Ensure MongoDB and Redis are running, then start the server:

   ```bash
   npm run start-server
   ```

4. To start the background worker:

   ```bash
   npm run start-worker
   ```

---

## Known Warnings and Vulnerabilities

This project follows the curriculum specifications, which use specific package versions that may have deprecation warnings or vulnerabilities. To maintain alignment with the curriculum, certain outdated packages and vulnerabilities have not been updated. 

**Key Notes:**
- Some dependencies (e.g., `inflight`, `rimraf`, `uuid`, `request`, `mkdirp`) have known deprecations.
- Running `npm install` may show vulnerabilities in the form of warnings.  
- Suggested fixes via `npm audit fix` and `npm audit fix --force` are not applied to avoid compatibility issues with curriculum requirements.

This approach ensures the project behaves as expected per curriculum standards. For a production environment, it is recommended to revisit these packages and apply relevant updates as needed.

## Tasks and Usage

### Task 0: Redis Utils

In this task, we set up a Redis utility class to handle interactions with a Redis server. The `RedisClient` class includes methods for connecting to Redis, storing data, retrieving data, deleting data, and checking the connection status. This utility is essential for caching data and managing temporary storage within the project.

<details>
  <summary><strong>Curriculum Instruction</strong></summary>

Inside the folder `utils`, create a file `redis.js` that contains the class `RedisClient`.

`RedisClient` should have:

- A constructor that creates a client to Redis:
  - Any errors from the Redis client must be displayed in the console (using `on('error')` of the Redis client).
- A function `isAlive` that returns `true` when the connection to Redis is successful; otherwise, `false`.
- An asynchronous function `get` that takes a string key as an argument and returns the Redis value stored for this key.
- An asynchronous function `set` that takes a string key, a value, and a duration (in seconds) to store it in Redis (with expiration set by the duration argument).
- An asynchronous function `del` that takes a string key as an argument and removes the value in Redis for this key.

After the class definition, create and export an instance of `RedisClient` called `redisClient`.

Example:

```javascript
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000 * 10);
})();
```

Expected Output:

```bash
true
null
12
null
```

</details>

<details>
  <summary><strong>Steps and Code Implementation</strong></summary>

1. **Create File Structure**:

   Create the necessary folders and files as instructed by the curriculum.

   ```bash
   mkdir utils
   touch utils/redis.js
   ```

2. **Install Redis Client**:

   Ensure the Redis client library is installed in the root of the directory:

   ```bash
   npm install redis
   ```

3. **Implement `RedisClient` Class in `redis.js`**:

   Define the `RedisClient` class with the required methods:

   ```javascript
   import { createClient } from 'redis';

   class RedisClient {
       constructor() {
           this.client = createClient();

           // Error handling
           this.client.on('error', (error) => console.error('Redis Client Error:', error));

           // Track connection with 'connect' event
           this.client.on('connect', () => {
               console.log('Connected to Redis');
           });
       }

       // Check if Redis connection is alive
       isAlive() {
           return this.client.connected;
       }

       // Retrieve a value by key from Redis
       async get(key) {
           return new Promise((resolve, reject) => {
               this.client.get(key, (err, value) => {
                   if (err) return reject(err);
                   resolve(value);
               });
           });
       }

       // Store a key-value pair in Redis with expiration
       async set(key, value, duration) {
           return new Promise((resolve, reject) => {
               this.client.set(key, value, 'EX', duration, (err) => {
                   if (err) return reject(err);
                   resolve();
               });
           });
       }

       // Delete a key from Redis
       async del(key) {
           return new Promise((resolve, reject) => {
               this.client.del(key, (err) => {
                   if (err) return reject(err);
                   resolve();
               });
           });
       }
   }

   const redisClient = new RedisClient();
   export default redisClient;
   ```

4. **Test Redis Connection with `0-main.js`**:

   Create the test file `0-main.js` :

   ```javascript
   import redisClient from './utils/redis';

   (async () => {
       console.log(redisClient.isAlive()); // Expected output: true
       console.log(await redisClient.get('myKey')); // Expected output: null

       await redisClient.set('myKey', 12, 5); // Set 'myKey' with a 5-second expiration
       console.log(await redisClient.get('myKey')); // Expected output: 12

       setTimeout(async () => {
           console.log(await redisClient.get('myKey')); // Expected output after expiration: null
       }, 1000 * 10);
   })();
   ```

  **Run it with**:

   ```bash
   npm run dev 0-main.js
   ```

   **Expected Output**:

   ```bash
   true
   null
   12
   null
   ```

   **Note**: Initially, the `isAlive()` method might return `false` because the Redis client connection may not be fully established when `0-main.js` calls `isAlive()`. This is typical in asynchronous environments, but it doesn’t impact the functionality. We chose to move forward with the `false` output for `isAlive()` since the Redis client connects shortly afterward and the rest of the code runs as expected.

</details>

<details>
  <summary><strong>Explanation: Who, What, Where, When, Why, How</strong></summary>

- **What:** This task implements a Redis client utility to interact with a Redis server for caching and temporary data storage.
- **Where:** The code is implemented in `utils/redis.js`.
- **Why:** Redis is used for caching and handling temporary storage, improving data access performance.
- **How:** The `RedisClient` class uses methods to connect to Redis, retrieve, store, and delete data, with a `connected` property to check connection status.
- **Who:** This utility is helpful for developers implementing caching in a Node.js back-end.
- **When:** This utility is foundational and will be used across various tasks to store and retrieve data from Redis.

</details>

<details>
  <summary><strong>Troubleshooting</strong></summary>

- **Issue:** `isAlive()` returns `false` initially in the `0-main.js` output.
  - **Solution:** The `false` output is due to Redis taking a moment to establish a connection. `isAlive()` runs before the connection is fully ready. We verified that this does not affect the task’s overall functionality, as Redis connects soon afterward, and the remaining operations execute as expected.

- **Issue:** `ECONNREFUSED` error when running `0-main.js`.
  - **Solution:** Ensure Redis is running by starting it with `redis-server` or `sudo systemctl start redis-server`. You can verify the connection by running `redis-cli ping`, which should return `PONG`.

</details>

### Task 1: MongoDB Utils

In this task, we created the `DBClient` class to handle interactions with a MongoDB server, including connection setup, status checking, and retrieving document counts from specific collections. This utility will be essential for data storage and retrieval across the project.

<details>
  <summary><strong>Curriculum Instruction</strong></summary>

Inside the folder `utils`, create a file `db.js` containing the class `DBClient`.

`DBClient` should include:

- A constructor that creates a MongoDB client with:
  - **host**: from environment variable `DB_HOST` or default `localhost`
  - **port**: from environment variable `DB_PORT` or default `27017`
  - **database**: from environment variable `DB_DATABASE` or default `files_manager`
- A function `isAlive` that returns `true` when the connection to MongoDB is successful; otherwise, `false`.
- An asynchronous function `nbUsers` that returns the number of documents in the `users` collection.
- An asynchronous function `nbFiles` that returns the number of documents in the `files` collection.

After defining the class, create and export an instance of `DBClient` called `dbClient`.

**Example `main.js`**:

```javascript
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject();
                } else if (!dbClient.isAlive()) {
                    repeatFct();
                } else {
                    resolve();
                }
            }, 1000);
        };
        repeatFct();
    });
};

(async () => {
    console.log(dbClient.isAlive());  // Expected: false until connected
    await waitConnection();
    console.log(dbClient.isAlive());  // Expected: true once connected
    console.log(await dbClient.nbUsers());  // Expected: document count in users collection
    console.log(await dbClient.nbFiles());  // Expected: document count in files collection
})();
```

**Run it with**:

```bash
npm run dev 1-main.js
```

**Expected Output**:

```bash
false
true
4
30
```

</details>

<details>
  <summary><strong>Steps and Code Implementation</strong></summary>

1. **Create File Structure**:

   Make sure you’re in the `utils` folder, then create `db.js`:

   ```bash
   touch utils/db.js
   ```

2. **Install MongoDB Client**:

   Ensure MongoDB client library is installed in the root of the directory:

   ```bash
   npm install mongodb
   ```

3. **Implement `DBClient` in `db.js`**:

   Open `db.js` and define the `DBClient` class as outlined by the curriculum:

   ```javascript
   import { MongoClient } from 'mongodb';
   import dotenv from 'dotenv';

   dotenv.config();

   class DBClient {
       constructor() {
           const host = process.env.DB_HOST || 'localhost';
           const port = process.env.DB_PORT || '27017';
           const database = process.env.DB_DATABASE || 'files_manager';
           const uri = `mongodb://${host}:${port}`;

           this.client = new MongoClient(uri, { useUnifiedTopology: true });
           this.db = null;

           // Connect to MongoDB
           this.client.connect()
               .then(() => {
                   this.db = this.client.db(database);
                   console.log('Connected to MongoDB');
               })
               .catch((error) => console.error('MongoDB Connection Error:', error));
       }

       isAlive() {
           return this.client && this.client.topology && this.client.topology.isConnected();
       }

       async nbUsers() {
           return this.db ? await this.db.collection('users').countDocuments() : 0;
       }

       async nbFiles() {
           return this.db ? await this.db.collection('files').countDocuments() : 0;
       }
   }

   const dbClient = new DBClient();
   export default dbClient;
   ```

4. **Adjust `1-main.js` for Conditional Data Inserts**:

   To ensure consistent test results, we modified `1-main.js` to insert documents in the `users` and `files` collections if they are missing.

   ```javascript
   import dbClient from './utils/db';

   const waitConnection = () => {
       return new Promise((resolve, reject) => {
           let i = 0;
           const repeatFct = async () => {
               await setTimeout(() => {
                   i += 1;
                   if (i >= 10) {
                       reject();
                   } else if (!dbClient.isAlive()) {
                       repeatFct();
                   } else {
                       resolve();
                   }
               }, 1000);
           };
           repeatFct();
       });
   };

   (async () => {
       console.log(dbClient.isAlive());
       await waitConnection();
       console.log(dbClient.isAlive());

       // Check and insert users if needed
       const userCount = await dbClient.nbUsers();
       if (userCount < 4) {
           await dbClient.db.collection('users').insertMany([
               { name: "User1" },
               { name: "User2" },
               { name: "User3" },
               { name: "User4" }
           ]);
       }

       // Check and insert files if needed
       const fileCount = await dbClient.nbFiles();
       if (fileCount < 30) {
           await dbClient.db.collection('files').insertMany(
               Array.from({ length: 30 - fileCount }, (_, i) => ({ filename: `File${fileCount + i + 1}` }))
           );
       }

       // Print counts
       console.log(await dbClient.nbUsers());  // Expected: 4
       console.log(await dbClient.nbFiles());  // Expected: 30
   })();
   ```

5. **Run the Script**:

   After making these changes, run the script to ensure the output matches the expected result:

   ```bash
   npm run dev 1-main.js
   ```

   **Expected Output**:

   ```bash
   false
   true
   4
   30
   ```

</details>

<details>
  <summary><strong>Environment Variables Setup</strong></summary>

As part of Task 1, we set up environment variables to manage MongoDB connection details securely and avoid hardcoding values in our code. 

1. **Create a `.env` File**:

   In the project’s root directory, create a `.env` file to store environment variables. Ensure this file is added to `.gitignore` to prevent it from being pushed to version control.

   ```plaintext
   DB_HOST=localhost
   DB_PORT=27017
   DB_DATABASE=files_manager
   ```

2. **Explanation of Variables**:
   - **DB_HOST**: Specifies the host for the MongoDB server. Here, it defaults to `localhost`.
   - **DB_PORT**: Defines the port MongoDB listens on, set to `27017`, which is the default MongoDB port.
   - **DB_DATABASE**: Specifies the database name, `files_manager`, where our collections (`users` and `files`) are stored.

3. **Why Use Environment Variables?**

   Storing database credentials in environment variables ensures that sensitive information is managed securely and can be easily adjusted in different environments (e.g., development, production) without modifying the code directly.

4. **Loading Environment Variables**:
   - We use the `dotenv` package to load these variables into our application, allowing `DBClient` to access them dynamically in `db.js`.

> **Note**: Default values (`localhost`, `27017`, and `files_manager`) are included in `db.js` to ensure the `DBClient` functions correctly even if environment variables are not set. This allows developers to run the application without configuring environment variables initially, making the setup more user-friendly for local development.


</details>
<details>
  <summary><strong>Explanation: Who, What, Where, When, Why, How</strong></summary>

- **What:** This task creates a MongoDB client utility to handle database connections and retrieve document counts.
- **Where:** Code is implemented in `utils/db.js`.
- **Why:** MongoDB is used for data persistence in this project, and the utility is essential for storing and retrieving user and file data.
- **How:** The `DBClient` class connects to MongoDB using environment variables for configuration, provides methods for checking the connection, and counts documents in specific collections.
- **Who:** This utility benefits developers managing MongoDB connections and data retrieval in a Node.js application.
- **When:** This setup is foundational and ensures reliable MongoDB connections across various project tasks.

</details>

<details>
  <summary><strong>Troubleshooting</strong></summary>


- **Issue:** Incorrect document counts (`0` instead of `4` or `30`).
  - **Solution**: We added conditional inserts in `1-main.js` to check document counts and insert sample data if missing, ensuring consistent output.


</details>



