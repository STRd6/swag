module.exports = (dbName='fs') ->
  db = new Dexie dbName
  
  db.version(1).stores
  	files: 'path, blob, size, type, createdAt, updatedAt'

  return db
