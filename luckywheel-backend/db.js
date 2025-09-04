const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
if (!uri) throw new Error("Missing MONGODB_URI");
if (!dbName) throw new Error("Missing DB_NAME");

const client = new MongoClient(uri, {});
let dbCache;

async function connectDB() {
  if (dbCache) return dbCache;
  await client.connect();
  console.log("✅ Connected to MongoDB Atlas");
  dbCache = client.db(dbName);
  return dbCache;
}
module.exports = connectDB;
