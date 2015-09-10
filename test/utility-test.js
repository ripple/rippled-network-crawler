'use strict';
var assert = require('chai').assert;
var expect = require('chai').expect;
var rc_util = require('../src/lib/utility.js');

var invalid_crawl = require('./data/invalid_crawl.json');
var valid_crawl = require('./data/valid_crawl.json');

var db_url = process.env.HBASE_URL; // testing engine might not have access to this url.

describe('Rawcrawl Util', function() {
  describe('#getRippleds()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getRippleds(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getRippleds(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getRippledsC()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getRippledsC(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getRippledsC(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getRippledsC(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getLinks()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getLinks(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getLinks(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getLinks(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getVersions()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getVersions(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getVersions(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getVersions(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getDegrees()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getDegrees(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getDegrees(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getDegrees(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getCrawledIpps()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getCrawledIpps(valid_crawl.data);
    });
    it("Should return an array", function() {
      var obj = rc_util.getCrawledIpps(valid_crawl.data);
      expect(obj).to.be.an('array');
    });
  });
  describe('#getIpps()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getIpps(valid_crawl.data);
    });
    it("Should return an array", function() {
      var obj = rc_util.getIpps(valid_crawl.data);
      expect(obj).to.be.an('array');
    });
  });
});

describe.skip('Database Util', function() {
  before(function(done) {
    this.timeout(10000);
    /* Post two crawls to db for testing */
    var Crawler = require('../src/lib/crawler.js').Crawler;
    var src = require('../src/program');

    var maxRequests = 100;
    var ipp = '162.217.98.90:51235';
    var crawler = new Crawler(maxRequests);
    crawler.getCrawl(ipp).then(function(response) {
      src.store(response, db_url, false).then(function() {
        src.store(response, db_url, false).then(function() {
          done();
        });
      });
    });
  });
  describe('#getLatestRow()', function() {
    it("Shouldn't throw an error when given valid database", function() {
      var logsql = false;
      rc_util.getLatestRow(db_url, logsql);
    });
    it("Should return an object with expected properties", function(done) {
      this.timeout(10000);
      var logsql = false;
      rc_util.getLatestRow(db_url, logsql)
      .then(function(row) {
        if (row) {
          expect(row).to.have.property('rowkey');
          expect(row.rowkey).to.be.a('string');

          expect(row).to.have.property('entry_ipp');
          expect(row.entry_ipp).to.be.a('string');

          expect(row).to.have.property('data');
          expect(row.data).to.be.a('string');

          expect(row).to.have.property('exceptions');
          expect(row.exceptions).to.be.a('string');
        }
      })
      .then(done, done);
    });
  });
});
