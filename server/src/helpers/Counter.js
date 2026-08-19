const database = require('../database');

const getNextSequence = async (name) => {
    const result = await database.mongodb.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
    );

    return result.seq;
};

module.exports = { getNextSequence };