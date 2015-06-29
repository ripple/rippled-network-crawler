var promise = require('chai').expect
var assert = require('chai').assert
var expect = require('chai').expect
var _ = require('lodash');
var Crawler = require('../src/crawler.js').Crawler;

describe('Crawler', function() {
  describe('#constructor', function() {
    // max requests
    it("Shouldn't throw an error when given valid max requests", function() {
      var crawler = new Crawler(100, console);
    });
    it("Shouldn't throw an error when given undefined max requests", function() {
      var crawler = new Crawler(undefined, console);
    });
    it("Shouldn't throw an error when given non numeric max requests", function() {
      var maxRequests = "lwarc";
      expect(function() {new Crawler(maxRequests)}).to.throw(Error);
    });

    // logger
    it("Shouldn't throw an error when given valid logger", function() {
      var crawler = new Crawler(100, console);
    });
    it("Shouldn't throw an error when given undefined logger", function() {
      var crawler = new Crawler(100);
    });
    it('Should throw an error when given logger without log and error properties', function() {
      maxRequests = 100;
      logger = 100;
      expect(function() {new Crawler(maxRequests, logger)}).to.throw(Error);
    });
    it('Should throw an error when given logger without proper log and error properties', function() {
      maxRequests = 100;
      logger = {log: true, error: true};
      expect(function() {new Crawler(maxRequests, logger)}).to.throw(Error);
    });
  });
  describe('#getCrawl()', function() {
    // type
    it('Should throw an error when not given string', function(done) {
      var crawler = new Crawler(100)
      var entryIP = 123

      crawler.getCrawl(entryIP).catch(function(error) {
        assert.strictEqual(error.message, "Invalid string")
      })
      .then(done, done);
    });    
    // ip address
    it('Should throw an error when given undefined ip address', function(done) {
      var crawler = new Crawler(100)
      var entryIP = undefined

<<<<<<< HEAD
      crawler.getCrawl(entryIP).catch(function(error) {
        assert.strictEqual(error.message, "Invalid string");
      })
=======
      crawler.getCrawl(entryIP).catch(function(error) {})
>>>>>>> added tests for getSelCrawl and caused bug in crawl_db
      .then(done, done);
    });
    it('Should throw an error when given invalid ip address', function(done) {
      var crawler = new Crawler(100)
      var entryIP = "1234"
      return crawler.getCrawl(entryIP).catch(function(error) {
          assert.strictEqual(error.message, "Invalid ip address (perhaps port missing)")
      })
      .then(done, done);
    });
    it('Should throw an error when given ip address without port', function(done) {
      var crawler = new Crawler(100)
      var entryIP = "212.83.147.166"
      return crawler.getCrawl(entryIP).catch(function(error) {
          assert.strictEqual(error.message, "Invalid ip address (perhaps port missing)")
      })
      .then(done, done);
    });
    it('Should return an object with valid properties when given valid ip address', function(done) {
      this.timeout(10000)
      var crawler = new Crawler(100)
      var entryIP = '192.170.145.70:51235'

      crawler.getCrawl(entryIP).then(function(data) {
        expect(data).to.have.property('start');
        expect(data.start).to.be.a('string');

        expect(data).to.have.property('end');
        expect(data.end).to.be.a('string');

        expect(data).to.have.property('entry');
        expect(data.entry).to.be.a('string');

        expect(data).to.have.property('data');
        expect(data.data).to.be.an('array');

        expect(data).to.have.property('errors');
        expect(data.errors).to.be.an('array');
      })
      .then(done, done);
    });
    it('Should return an object with valid properties when given unreachable but valid ip address', function(done) {
      this.timeout(10000)
      var crawler = new Crawler(100)
      var entryIP = '212.83.147.166:51235'

      crawler.getCrawl(entryIP).then(function(data) {
        expect(data).to.have.property('start');
        expect(data.start).to.be.a('string');

        expect(data).to.have.property('end');
        expect(data.end).to.be.a('string');

        expect(data).to.have.property('entry');
        expect(data.entry).to.be.a('string');

        expect(data).to.have.property('data');
        expect(data.data).to.be.an('array');

        expect(data).to.have.property('errors');
        expect(data.errors).to.be.an('array');
      })
      .then(done, done);
    });
  });
  describe('#getSelCrawl()', function() {
    // type
    it('Should throw an error when not given array', function(done) {
      var crawler = new Crawler(100)
      var ipps = 123

      crawler.getSelCrawl(ipps).catch(function(error) {
        assert.strictEqual(error.message, "Invalid array")
      })
      .then(done, done);
    });
    // ip address
    it('Should throw an error when not given string for ip address', function(done) {
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", 123]

      crawler.getSelCrawl(ipps).catch(function(error) {
        assert.strictEqual(error.message, "Invalid string")
      })
      .then(done, done);
    });    
    it('Should throw an error when given any undefined ip address', function(done) {
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", undefined]

      crawler.getSelCrawl(ipps).catch(function(error) {
        assert.strictEqual(error.message, "Invalid string");
      })
      .then(done, done);
    });
    it('Should throw an error when given invalid ip address', function(done) {
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", "123"]

      return crawler.getSelCrawl(ipps).catch(function(error) {
          assert.strictEqual(error.message, "Invalid ip address (perhaps port missing)")
      })
      .then(done, done);
    });
    it('Should throw an error when given ip address without port', function(done) {
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", "192.170.145.70"]

      return crawler.getSelCrawl(ipps).catch(function(error) {
          assert.strictEqual(error.message, "Invalid ip address (perhaps port missing)")
      })
      .then(done, done);
    });
    it('Should return an object with valid properties when given valid ip address', function(done) {
      this.timeout(10000)
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", "74.201.214.198:51235"]

      crawler.getSelCrawl(ipps).then(function(data) {
        expect(data).to.have.property('start');
        expect(data.start).to.be.a('string');

        expect(data).to.have.property('end');
        expect(data.end).to.be.a('string');

        expect(data).to.have.property('entry');
        expect(data.entry).to.be.a('string');

        expect(data).to.have.property('data');
        expect(data.data).to.be.an('array');

        expect(data).to.have.property('errors');
        expect(data.errors).to.be.an('array');
      })
      .then(done, done);
    });
    it('Should return an object with valid properties when given unreachable but valid ip address', function(done) {
      this.timeout(10000)
      var crawler = new Crawler(100)
      var ipps = ["192.170.145.70:51235", "74.201.214.198:51235"]

      crawler.getSelCrawl(ipps).then(function(data) {
        expect(data).to.have.property('start');
        expect(data.start).to.be.a('string');

        expect(data).to.have.property('end');
        expect(data.end).to.be.a('string');

        expect(data).to.have.property('entry');
        expect(data.entry).to.be.a('string');

        expect(data).to.have.property('data');
        expect(data.data).to.be.an('array');

        expect(data).to.have.property('errors');
        expect(data.errors).to.be.an('array');
      })
      .then(done, done);
    });
  });
});
