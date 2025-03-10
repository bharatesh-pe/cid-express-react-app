/* eslint-disable camelcase */
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const env = require('../env');
const secret="3d0f5f3e9d1fcb2aee7d5c4d29d7f41d6e0a4c8b2e98a6e00f9b4e6e7f3a1b8b";
/*
 * isValidEmail helper method
 * @param {string} email
 * @returns {Boolean} True or False
 */
const isValidEmail = (email) => {
    const regEx = /\S+@\S+\.\S+/;
    return regEx.test(email);
};

const isValidMobile = (mobile) => {
    const regEx = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    return regEx.test(mobile);
};

/**
 * validatePassword helper method
 * @param {string} password
 * @returns {Boolean} True or False
 */
const validatePassword = (password) => {
    if (password.length < 8 || password === '') {
        return false;
    }
    return true;
};

/**
 * isEmpty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
    if (input.replace(/\s/g, '').length) {
        return false;
    }
    return true;
};

/**
 * empty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const empty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
};

/**
 * Generate Token
 * @param {string} id
 * @returns {string} token
 */
const generateUserToken = (kgid,role_id ,user_id) => {

    var paramsObj = {
	    kgid:kgid,role_id:role_id,user_id:user_id
    };

   console.log(paramsObj,"paramsObj") 
   // Object.assign(paramsObj, { kgid: kgid,role_id:role_id ,user_id:user_id}) 

    const token = jwt.sign(paramsObj, secret, { expiresIn: '3d' });
    return token;
};
/**
 * Validate Token
 * @param {object} header
 * @returns {Object} token details
 */

const validate_token = (req, res, next) => {
    try {
        const header = req.headers;
        if (!header.token) {
            return new Error('Authorization error: Token is missing');
        }
        const decoded = jwt.verify(header.token, secret);
        var paramsObj = {
            kgid: decoded.kgid,
            role_id: decoded.role_id,
            user_id: decoded.user_id
        };
        req.user = paramsObj;
        console.log(req.user,"REQ")
        next();
    } catch (error) {
        throw new Error('Authorization error: Invalid token');
    }
};





module.exports = {
  isValidEmail,
    isValidMobile,
    validatePassword,
    isEmpty,
    empty,
    generateUserToken,validate_token
};
