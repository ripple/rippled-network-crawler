var _ = require('lodash');
var util = require('util');
var request = require('request');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var ripple = require('ripple-lib');
var sjcl = ripple.sjcl;
var check = require('check-types');
var Promise = require('bluebird')

/* --------------------------------- CONSTS --------------------------------- */

var DEBUG = true;

var REQUEST_STATUS = {
  QUEUED: 1,
  REQUESTING: 2
};

var DEFAULT_PORT = 51235

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

function crawlUrl(domainOrIp) {
  return 'https://' + withDefaultPort(domainOrIp) + '/crawl';
}

function withDefaultPort(domainOrIp) {
  return domainOrIp.indexOf(':') !== -1 ? domainOrIp :
                                          domainOrIp + ':' + DEFAULT_PORT;
}

function normalizePubKey(pubKeyStr) {
  if (pubKeyStr.length > 50 && pubKeyStr[0] == 'n') {
    return pubKeyStr;
  }

  var bits = sjcl.codec.base64.toBits(pubKeyStr);
  var bytes = sjcl.codec.bytes.fromBits(bits);
  return ripple.Base.encode_check(ripple.Base.VER_NODE_PUBLIC, bytes);
}

/*
* deals with a variety of (ip, port) possibilities that occur 
* in rippled responses and normalizes them to the format 'ip:port'
*/
function normalizeIpp(ip, port) {
  if (ip) {
    var split = ip.split(':'),
        splitIp = split[0],
        splitPort = split[1];

    out_ip = splitIp
    out_port = port || splitPort || DEFAULT_PORT
    var ipp = out_ip + ':' + out_port
  } else {
    throw new Error("ip is undefined")
  }

  return ipp
}

/* --------------------------------- CRAWLER -------------------------------- */

function Crawler(maxRequests, logger) {
  EventEmitter.call(this);
  
  // maxRequests checks
  maxRequests = maxRequests ? maxRequests : 30;
  check.assert.number(maxRequests, "Invalid max requests");
  if (maxRequests < 1) {
    throw new Error("Invalid max requests");
  }
  
  // logger checks
  logger = logger ? logger : console
  if (!logger.log || !logger.error) {
    throw new Error("Invalid logger");
  }
  if (typeof logger.log != "function" || typeof logger.error != "function") {
    throw new TypeError("log and error must be functions");
  }

  this.maxRequests = maxRequests;
  this.currentRequests = 0; // active requests
  this.rawResponses = {}; // {$ip_and_port : $normalised_response}
  this.queued = {}; // {$ip_and_port : REQUEST_STATUS.*}
  this.errors = {}; // {$ip_and_port : $error_code_int}
  this.peersData = {}; // {b58_normed(pubKey) : {...}}
  this.logger = logger;
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.getCrawl = function(entryIp) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (entryIp === undefined) {
      throw new Error("Invalid ip address")
    }
    if (entryIp.split(' ').length != 1 || !IPP_PATTERN.test(entryIp)) {
      throw new Error("Invalid ip address (perhaps port missing)")
    }
    self.once('done', function(response) {
      return resolve(response)
    }).enter(entryIp)
  })
}

/*
* Enter at ip to start crawl
*/
Crawler.prototype.enter = function(ip) {
  this.startTime = moment().format();
  this.entryIP = withDefaultPort(ip);
  this.crawl(withDefaultPort(ip), 0);
};

/**
* @param {String} ipp - ip and port to crawl
* @param {Number} hops - from initial entryPoint
*/
Crawler.prototype.crawl = function(ipp, hops) {
  var self = this;
  self.queued[ipp] = REQUEST_STATUS.REQUESTING;

  self.crawlOne(ipp, function(err, response, body) {
    self.dequeue(ipp);

    if (err) {
      self.logger.error(ipp + ' has err ', err);
      self.errors[ipp] = err.code;
    } else {
      // save raw body
      self.rawResponses[ipp] = body;

      // Normalize body and loop over each normalized peer
      body.overlay.active.forEach(function(p) {
        try {
          self.enqueueIfNeeded(normalizeIpp(p.ip, p.port));
        } catch (err) {
          self.logger.error(p.public_key + ' has err ', err.message);
        }
      });
    }
    
    // Crawl peers
    if (!self.requestMore(hops)) {
      self.endTime = moment().format();
      self.emit('done', { start:    self.startTime,
                          end:      self.endTime,
                          entry:    self.entryIP,
                          data:     self.rawResponses,
                          errors:   self.errors
                        });
    }
  });
};

/**
*
* Peers will reveal varying degrees of information about connected peers .Save a
* given views's data into a merged dict. We take the first view's version we see
* for any key in the dict
*
* TODO: track and warn when peers report conflicting info.
*
* @param {String} pk - public key (id) of peer
* @param {Object} data - one individual view of that peers data
*
*/
Crawler.prototype.savePeerData = function(pk, data, defaults) {
  var map = this.peersData[pk] !== undefined ? this.peersData[pk] :
                                               this.peersData[pk] = {};

  _.forOwn(data, function(v, k) {
    // Type is specific to each point of view. We don't save it, in case we
    // accidentally try and use it later (don't laugh ... )
    if (k === 'type' || (defaults && map[k] !== undefined) ) {
      return;
    }
    map[k] = v;
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
  var self = this;
  var options = { url: crawlUrl(ip), 
                  timeout: 5000, 
                  rejectUnauthorized: false,
                  requestCert: true,
                  agent: false };
  request(options, function(err, response, body) {
    onResponse(err, response, body ? JSON.parse(body) : null);
  });
}

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
}

/*
* Enqueue if this node hasn't already been crawled
*/
Crawler.prototype.enqueueIfNeeded = function(ipp) {
  if (ipp) {
    if ((this.rawResponses[ipp] === undefined) &&
        (this.queued[ipp] === undefined) &&
        (this.errors[ipp] === undefined)) {
      this.enqueue(ipp);
    }
  }
}

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

