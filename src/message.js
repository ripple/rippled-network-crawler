var AWS = require('aws-sdk');
var moment = require('moment');
AWS.config.region = 'us-west-2';
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var Promise = require('bluebird');

module.exports = function(row, queueUrl) {
  return new Promise(function(resolve, reject) {
    var params = {
      MessageBody: row.id, /* required */
      QueueUrl: queueUrl, /* required */
      DelaySeconds: 0
    };
    sqs.sendMessage(params, function(error, data) {
      if (error) {
        reject(error);
      } else {
        console.log('Queued crawl %d (%s) \t at %s \t to %s',
                row.id, moment(row.start_at).format(),  moment().format(), queueUrl);
        resolve(data);
      }
    });
  });
};
