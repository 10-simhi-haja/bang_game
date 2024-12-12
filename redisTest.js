import redis from 'redis';
const express = require('express');
const router = express.Router();
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  password: '1q2w3e4r',
});
/* GET home page. */
router.get('/', function (req, res, next) {
  redisClient.get('NAME', (err, result) => {
    console.log(result);
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
