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

async function fetchAndCalculatePercentageAgeDistribution() {
    const client = await pool.connect();
  
    try {
      const tableName = 'users';
  
      const result = await client.query(`SELECT * FROM ${tableName}`);
  
      const totalRecords = result.rows.length;
  
      const ageGroups = {
        "<20": 0,
        "20-40": 0,
        "40-60": 0,
        ">60": 0
      };
  
      result.rows.forEach(row => {
        const age = row.age;   
        if (age < 20) {
          ageGroups["<20"]++;
        } else if (age >= 20 && age <= 40) {
          ageGroups["20-40"]++;
        } else if (age > 40 && age <= 60) {
          ageGroups["40-60"]++;
        } else {
          ageGroups[">60"]++;
        }
      });
  
      const percentageAgeGroups = {};
      Object.keys(ageGroups).forEach(group => {
        percentageAgeGroups[group] = (ageGroups[group] / totalRecords) * 100;
      });
  
      return percentageAgeGroups;
    } catch (error) {
      console.error('Error fetching and calculating percentage age distribution from PostgreSQL:', error);
      throw new Error('Error fetching and calculating percentage age distribution from PostgreSQL');
    } finally {
      client.release();
    }
  }
  

module.exports = {
    insertDataIntoPostgres: insertDataIntoPostgres,
    fetchDataAndGroupByAge : fetchAndCalculatePercentageAgeDistribution
 }