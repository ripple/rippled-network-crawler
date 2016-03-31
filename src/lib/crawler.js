'use strict';
var _ = require('lodash');
var util = require('util');
var request = require('request');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var ripple = require('ripple-lib');
var sjcl = ripple.sjcl;
var check = require('check-types');
var Promise = require('bluebird');

/* --------------------------------- CONSTS --------------------------------- */

var DEBUG = true;

var REQUEST_STATUS = {
  QUEUED: 1,
  REQUESTING: 2
};

var DEFAULT_PORT = undefined;

var IPP_PATTERN = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\:([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b/;

/* --------------------------------- HELPERS -------------------------------- */

function abortIfNot(expression, message) {
  if (!expression) {
    if (!DEBUG) {
      throw new Error(message);
    } else {
      console.error(message);
      process.exit();
    }
  }
}

function withDefaultPort(domainOrIp) {
  return domainOrIp.indexOf(':') !== -1 ? domainOrIp :
                                          domainOrIp + ':' + DEFAULT_PORT;
}

function crawlUrl(domainOrIp) {
  return 'https://' + withDefaultPort(domainOrIp) + '/crawl';
}

function normalizePubKey(pubKeyStr) {
  if (pubKeyStr.length > 50 && pubKeyStr[0] === 'n') {
    return pubKeyStr;
  }

  var bits = sjcl.codec.base64.toBits(pubKeyStr);
  var bytes = sjcl.codec.bytes.fromBits(bits);
  return ripple.Base.encode_check(ripple.Base.VER_NODE_PUBLIC, bytes);
}

/*
* Deals with a variety of (ip, port) possibilities that occur
* in rippled responses and normalizes them to the format 'ip:port'
*/
function normalizeIpp(ip, port) {
  if (ip) {
    var split = ip.split(':'),
        splitIp = split[0],
        splitPort = split[1];

    var out_ip = splitIp;
    var out_port = port || splitPort || DEFAULT_PORT;
    if (out_port) {
      var ipp = out_ip + ':' + out_port;
      return ipp;
    }
  }

  throw new Error('ip is undefined');
}

/* --------------------------------- CRAWLER -------------------------------- */

/*
* @param {Integer} max number of requests crawler will make at a time
* @param {Logger} logger that crawler uses (should have .log .error functions)
* Crawler constructor
*/
function Crawler(maxRequests, logger) {
  EventEmitter.call(this);

  // maxRequests checks
  maxRequests = maxRequests ? maxRequests : 30;
  check.assert.number(maxRequests, 'Invalid max requests');
  if (maxRequests < 1) {
    throw new Error('Invalid max requests');
  }

  // logger checks
  logger = logger ? logger : console;
  if (!logger.log || !logger.error) {
    throw new Error('Invalid logger');
  }
  if (typeof logger.log !== 'function' || typeof logger.error !== 'function') {
    throw new TypeError('log and error must be functions');
  }

  this.maxRequests = maxRequests;
  this.currentRequests = 0; // active requests
  this.queued = {}; // {$ip_and_port : REQUEST_STATUS.*}
  this.done = {}; // {$ip_and_port : 1}
  this.rawResponses = []; // [{$ip_and_port : $raw_response}]
  this.errors = []; // {$ip_and_port/public_key : $error_object}
  this.logger = logger;
}
util.inherits(Crawler, EventEmitter);

/*
* @param {String} ipp - ip and port to crawl
* Initiate complete crawl starting from entryIp and
* returns results and errors in a promise.
*/
Crawler.prototype.getCrawl = function(entryIp) {
  var self = this;
  return new Promise(function(resolve, reject) {
    check.assert.string(entryIp);
    if (entryIp === undefined) {
      throw new Error('Invalid ip address');
    }
    if (entryIp.split(' ').length !== 1 || !IPP_PATTERN.test(entryIp)) {
      throw new Error('Invalid ip address (perhaps port missing)');
    }
    self.once('done', function(response) {
      return resolve(response);
    }).enter(withDefaultPort(entryIp));
  });
};

/*
* @param {Array} ipps - ip and port to crawl
* Initiate selective crawl at ipps and
* return results and errors in a promise.
* Selective means that crawl won't expand
* to peers of each node. The only requests that
* will be gathered are from ipps' /crawl endpoints.
*/
Crawler.prototype.getSelCrawl = function(ipps) {
  var self = this;
  return new Promise(function(resolve, reject) {
    check.assert.array(ipps);
    _.each(ipps, function(ipp) {
      check.assert.string(ipp);
      if (ipp === undefined) {
        throw new Error('Invalid ip address');
      }
      if (ipp.split(' ').length !== 1 || !IPP_PATTERN.test(ipp)) {
        throw new Error('Invalid ip address (perhaps port missing)');
      }
    });
    self.once('done', function(response) {
      return resolve(response);
    }).enterSel(_.map(ipps, withDefaultPort));
  });
};

/*
* @param {String} ipp to start crawl on
* Start crawl
*/
Crawler.prototype.enter = function(ipp) {
  this.startTime = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
  this.entryIP = ipp;
  this.crawl(ipp, 0);
};

/*
* @param {Array} ipps to crawl
* Start selective crawl
*/
Crawler.prototype.enterSel = function(ipps) {
  this.startTime = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
  this.entryIP = ipps.toString();
  this.crawlSelective(ipps);
};

/*
* @param {String} ipp - ip and port to crawl
* @param {Number} hops - from initial entryPoint
* Collect crawl reponses from ipp
* and expand crawl to its peers recursively
* while keeping track of hops (distance from inital entry point)
*/
Crawler.prototype.crawl = function(ipp, hops) {
  var self = this;
  self.queued[ipp] = REQUEST_STATUS.REQUESTING;
  self.crawlOne(ipp, function(error, response, body) {

    self.dequeue(ipp);

    if (!error && !body.overlay) {
      error = {
        message: 'empty overlay'
      }
    }

    if (error) {
      // save error
      var err = {};
      err[ipp] = error.message;
      self.errors.push(err);

      //self.logger.error(ipp, 'has error', error);
    } else {
      // mark ipp as done (received response)
      self.done[ipp] = 1;

      // save raw body
      var resp = {};
      resp[ipp] = body;
      self.rawResponses.push(resp);

      // Normalize body and loop over each normalized peer
      body.overlay.active.forEach(function(p) {
        try {
          self.enqueueIfNeeded(normalizeIpp(p.ip, p.port));
        } catch (error) {
          //self.logger.error(p.public_key, 'has error:', error);
        }
      });
    }

    // Crawl peers
    if (!self.requestMore(hops)) {
      self.endTime = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
      self.emit('done', {start: self.startTime,
                         end: self.endTime,
                         entry: self.entryIP,
                         data: self.rawResponses,
                         errors: self.errors});
    }
  });
};

/*
* @param {Array} ipps - Array of ipps
* Collect crawl reponses from ipps
* without expanding crawl to their peers
*/
Crawler.prototype.crawlSelective = function(ipps) {
  var self = this;
  this.startTime = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
  _.each(ipps, function(ipp) {
    self.enqueueIfNeeded(ipp);
    self.crawlOne(ipp, function(error, response, body) {
      self.dequeue(ipp);
      if (error) {
        // save error
        var err = {};
        err[ipp] = error.message;
        self.errors.push(err);

        //self.logger.error(ipp, 'has error', error);
      } else {
        // mark ipp as done (received response)
        self.done[ipp] = 1;

        // save raw body
        var resp = {};
        resp[ipp] = body;
        self.rawResponses.push(resp);
      }

      // End if all responses received
      if (Object.keys(self.queued).length === 0) {
        self.endTime = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
        self.emit('done', {start: self.startTime,
                            end: self.endTime,
                            entry: self.entryIP,
                            data: self.rawResponses,
                            errors: self.errors});
      }
    });
  });
};

/*
* Crawls over one node at ipp and retreives json
*/
Crawler.prototype.crawlOne = function(ipp, cb) {
  var self;
  this.currentRequests++;
  self = this;
  self.crawlRequest(ipp, function(err, response, json) {
    self.currentRequests--;
    self.emit('request', err, response, json);
    cb(err, response, json);
  });
};

/*
* Actually sends the request to retreive the json
*/
Crawler.prototype.crawlRequest = function(ip, onResponse) {
  var options = {url: crawlUrl(ip),
                 timeout: 5000,
                 rejectUnauthorized: false,
                 requestCert: true,
                 agent: false};
  var start_moment = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
  request(options, function(err, response, body) {
    var json = body ? JSON.parse(body) : {};
    json.request_end_at = moment().format("YYYY-MM-DDTHH:mm:ss.msZ");
    json.request_start_at = start_moment;
    onResponse(err, response, json);
  });
};

Crawler.prototype.requestMore = function(hops) {
  var self = this;
  var ipps = Object.keys(self.queued);

  ipps.forEach(function(queuedIpp) {
    if (self.currentRequests < self.maxRequests) {
      if (self.queued[queuedIpp] === REQUEST_STATUS.QUEUED) {
        self.crawl(queuedIpp, hops + 1);
      }
    } else {
      return false;
    }
  });

  return ipps.length !== 0;
};

/*
* Enqueue if this node hasn't already been crawled
*/
Crawler.prototype.enqueueIfNeeded = function(ipp) {
  if (ipp) {
    if ((this.done[ipp] === undefined) &&
        (this.queued[ipp] === undefined) &&
        (this.errors[ipp] === undefined)) {
      this.enqueue(ipp);
    }
  }
};

Crawler.prototype.enqueue = function(ipp) {
  abortIfNot(this.queued[ipp] === undefined, 'queued already');
  this.queued[ipp] = REQUEST_STATUS.QUEUED;
};

Crawler.prototype.dequeue = function(ipp) {
  abortIfNot(this.queued[ipp] !== undefined, 'not queued already');
  delete this.queued[ipp];
};

exports.Crawler = Crawler;
exports.normalizeIpp = normalizeIpp;
exports.normalizePubKey = normalizePubKey;

