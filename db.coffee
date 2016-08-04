module.exports = (dbName='fs') ->
  db = new Dexie dbName

  db.version(1).stores
  	files: 'path, blob, type, createdAt, updatedAt'

  return db
