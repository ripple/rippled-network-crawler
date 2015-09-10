var AWS = require('aws-sdk');
var moment = require('moment');
AWS.config.region = 'us-west-2';
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var Promise = require('bluebird');
var hbaseUtils = require('./lib/hbaseHelper').utils;

module.exports = function(key, queueUrl) {
  return new Promise(function(resolve, reject) {
    var params = {
      MessageBody: key, /* required */
      QueueUrl: queueUrl, /* required */
      DelaySeconds: 0
    };
    sqs.sendMessage(params, function(error, data) {
      if (error) {
        reject(error);
      } else {
        console.log('Queued crawl %s (%s) \t at %s \t to %s', key,
          hbaseUtils.keyToStart(key), moment().format(), queueUrl);
        resolve(data);
      }
    });
  });
};
