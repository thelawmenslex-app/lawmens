const jwt = require('jsonwebtoken');
const config = process.env.JWT_SECRET;
const bcrypt = require('bcryptjs');
const constants = require('./constants');
//function for success response
//function for error response
function sanitizeData(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj.toObject === 'function') {
        obj = obj.toObject();
    }
    if (obj instanceof Date) return obj;
    if (typeof obj === 'object') {
        // Handle MongoDB ObjectId
        if (obj.constructor && (obj.constructor.name === 'ObjectId' || obj.constructor.name === 'ObjectID')) {
            return obj.toString();
        }
        if (obj._bsontype === 'ObjectId' || obj._bsontype === 'ObjectID') {
            return obj.toString();
        }
        // Handle MongoDB Decimal128 or Long
        if (obj.constructor && (obj.constructor.name === 'Decimal128' || obj.constructor.name === 'Long')) {
            return Number(obj.toString());
        }
        if (obj._bsontype === 'Long' || obj._bsontype === 'Decimal128') {
            return Number(obj.toString());
        }
        if ('$numberLong' in obj) {
            return Number(obj.$numberLong);
        }
        if ('$numberInt' in obj) {
            return Number(obj.$numberInt);
        }
        if ('$numberDouble' in obj) {
            return Number(obj.$numberDouble);
        }
        if ('$numberDecimal' in obj) {
            return Number(obj.$numberDecimal);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeData);
        } else {
            const result = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    result[key] = sanitizeData(obj[key]);
                }
            }
            return result;
        }
    }
    return obj;
}

function sendResponse(res, status, statusCode, message, data) {
    const cleanData = sanitizeData(data);
    return res.status(statusCode).json({ status, statusCode, message, data: cleanData });
}
function errorHandler(err, res) {
    const response = {
        code: err.statusCode,
        message: err.message,
    };
    if (!response.code) {
        response.code = 400;
    }
    console.log(err)
    return res
        .status(response.code)
        .json({ message: 'Oops,something went wrong', error: ' ' + err });
}
//function for generate jwt token
const generateToken = (data, expireTime) => {
    const token = jwt.sign({ token: data }, config, expireTime);
    return token;
};
const decryptToken = (data) => {
    const token = jwt.verify(data, config);
    return token;
};
//function for encrypt the password
const encryptPassword = async (data) => {
    const salt = 10;
    const encryptedPassword = await bcrypt.hash(data, salt);
    return encryptedPassword;
};
//function for decrypt the password
const decryptPassword = async (data, pass) => {
    const password = await bcrypt.compare(data, pass);
    return password;
};
//function for generate otp
const generateOTP = () => {
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += Math.floor(Math.random() * 10);
    }
    return OTP;
};

function groupByCategoryType(sections) {
    return sections.reduce((groups, section) => {
        const categoryType = section.categoryType;
        if (!groups[categoryType]) {
            groups[categoryType] = [];
        }
        groups[categoryType].push(section);
        return groups;
    }, {});
}

const calculateDaysBetween = (date1, date2) => {
    // Convert the input dates to JavaScript Date objects
    const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays;
}

const calculateExpirationDate=(validityPeriod, validityDate)=> {
    // Convert the validity date to a JavaScript Date object
    const validityDateObj = new Date(validityDate);
  
    // Calculate the expiration date by adding the validity period
    const expirationDate = new Date(validityDateObj.getTime() + (validityPeriod * 24 * 60 * 60 * 1000));
  
    // Format the expiration date as a string
    const expirationDateString = expirationDate.toLocaleDateString();
  
    return expirationDateString;
  }
  const calculateNewDate=(validityPeriod, validityDate)=> {
    // Convert the validity date to a JavaScript Date object
    const validityDateObj = new Date(validityDate);
  
    // Calculate the expiration date by adding the validity period
    const expirationDate = new Date(validityDateObj.getTime() + (validityPeriod * 24 * 60 * 60 * 1000));
  
    expirationDate.setDate(expirationDate.getDate() + 1);
    // Format the expiration date as a string
  
    return expirationDate;
  }
const calculateEXpDate = (validityPeriod, validityDate) => {
    // Convert the validity date to a JavaScript Date object
    const validityDateObj = new Date(validityDate);

    // Calculate the expiration date by adding the validity period
    const expirationDate = new Date(validityDateObj.getTime() + (validityPeriod * 24 * 60 * 60 * 1000));
    return expirationDate;
}
module.exports = {
    sendResponse,
    errorHandler,
    generateToken,
    encryptPassword,
    decryptPassword,
    decryptToken,
    generateOTP,
    groupByCategoryType,
    calculateDaysBetween,
    calculateExpirationDate,
    calculateNewDate,
    calculateEXpDate
};
