const { v4: uuidv4 } = require('uuid');

const generateGroupId = () => {
    return uuidv4();
}

module.exports = { generateGroupId };
