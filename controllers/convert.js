const fs = require('fs');
const {parse} = require('csv-parse');
const { promisify } = require('util');

const config = require('../app-config.json');
const {insertDataIntoPostgres, fetchDataAndGroupByAge} = require('../models/users');

const readFileAsync = promisify(fs.readFile);
const parseAsync = promisify(parse);


exports.toJson = async(req, res, next) => {
    try {
        const csvData = [];
        let result = await csvToJson(config.filelocation);
        await insertToPostGres(result[1]);
        await getAgePercentageDistribution();
        res.json(result[0]);
    } catch (error) {
        console.log(error);
    }
} 

exports.health = async(req, res, next) => {
    res.status(200).json('Good')
}

async function csvToJson(csvFilePath) {
    try {
      const jsonArray = [];
      const postGresArray = [];
      // Read the CSV file
      const csvData = await readFileAsync(csvFilePath, 'utf-8');
  
      // Parse CSV data
      const records = await parseAsync(csvData, { columns: true });
  
      records.forEach(record => {
        const jsonData = {};
        let postGresData = {};
        Object.entries(record).forEach(([header, value]) => {
          const dotIndex = header.indexOf('.');
          if (dotIndex !== -1) {
            const category = header.slice(0, dotIndex);
            const key = header.slice(dotIndex + 1);
  
            if (!jsonData[category]) {
              jsonData[category] = {};
            }
  
            jsonData[category][key] = value;
          } else {
            jsonData[header] = value;
          }
        });
        postGresData =  JSON.parse(JSON.stringify(jsonData))
        if (postGresData['name'] && postGresData['name']['firstname'] && postGresData['name']['lastname']) {
          postGresData['name'] = String(`${postGresData['name']['firstname']} ${postGresData['name']['lastname']}`);
        }

        if(postGresData['gender'] && postGresData['age']) {
          postGresData['additional_info'] = {gender: postGresData['gender'], age: postGresData['age']}
          postGresData['age'] = parseInt(postGresData['age']); 
        }
        delete postGresData['gender'];
        postGresArray.push(postGresData)
        jsonArray.push(jsonData);
      });
  
      return [jsonArray, postGresArray];
    } catch (error) {
      throw new Error('Error converting CSV to JSON: ' + error.message);
    }
}


async function insertToPostGres(result) {
  result.forEach(async val => {
    await insertDataIntoPostgres(val)
  })
  return 1;
}

async function getAgePercentageDistribution() {
  const result = await fetchDataAndGroupByAge()
  console.log(result);
}