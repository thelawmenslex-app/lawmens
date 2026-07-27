const xlsx = require('xlsx');

const readFile=async(filepath)=>{
const result=[]
// Read the Excel file
const workbook = xlsx.readFile(filepath);

// Get the names of all the sheets
const sheetNames = workbook.SheetNames;
sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    result.push({sheetName:sheetName,data:data})
  });
  return result;
}

module.exports={
    readFile
}

