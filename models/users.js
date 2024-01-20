const pool = require('../utils/pg');

async function insertDataIntoPostgres(jsonData) {
    const client = await pool.connect();
    try {
        const tableName = 'users';
        const keys = Object.keys(jsonData);
        const values = keys.map(key => JSON.stringify(jsonData[key]));
  
        const query = {
          text: `INSERT INTO ${tableName}(${keys.join(', ')}) VALUES(${keys.map((_, index) => `$${index + 1}`).join(', ')})`,
          values,
        };
        console.log(query.text)
        await client.query(query);
        return true;
      
    } catch(error){
        return false;
    } finally {
      client.release();
    }
}

module.exports = {insertDataIntoPostgres}