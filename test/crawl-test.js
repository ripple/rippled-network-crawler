var promise = require('chai').expect
var assert = require('chai').assert
var expect = require('chai').expect
var _ = require('lodash');
var Crawler = require('../src/crawler.js').Crawler;

describe('Crawler', function() {
  describe('#constructor', function() {
    // max requests
    it('Shouldn\'t return an error when given valid max requests', function() {
      var crawler = new Crawler(100, console);
    });
    it('Shouldn\'t return an error when given undefined max requests', function() {
      var crawler = new Crawler(undefined, console);
    });
    it('Should return an error when given non numeric max requests', function() {
      var maxRequests = "lwarc";
      expect(function() {new Crawler(maxRequests)}).to.throw(Error);
    });

    // logger
    it('Shouldn\'t return an error when given valid logger', function() {
      var crawler = new Crawler(100, console);
    });
    it('Shouldn\'t return an error when given undefined logger', function() {
      var crawler = new Crawler(100, undefined);
    });
    it('Should return an error when given invalid logger', function() {
      maxRequests = 100;
      logger = 100;
      expect(function() {new Crawler(maxRequests, logger)}).to.throw(Error);
    });
  });
  describe('#getCrawl()', function() {
    // ip address
    it('Should return an error when given undefined ip address', function(done) {
      var crawler = new Crawler(100)
      var entryIP = undefined

      crawler.getCrawl(entryIP).catch(function(error) {
        assert.strictEqual(error.message, "Invalid ip address")
      })
      .then(done, done);
    });
    it('Should return an error when given invalid ip address', function(done) {
      var crawler = new Crawler(100)
      var entryIP = "1234"
      return crawler.getCrawl(entryIP).catch(function(error) {
          assert.strictEqual(error.message, "Invalid ip address (perhaps port missing)")
      })
      .then(done, done);
    });
    it('Should return an error when given ip address without port', function(done) {
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
        expect(data).to.have.property('end');
        expect(data).to.have.property('entry');
        expect(data).to.have.property('data');
        expect(data).to.have.property('errors');
      })
      .then(done, done);
    });
    it('Should return an object with valid properties when given unreachable but valid ip address', function(done) {
      this.timeout(10000)
      var crawler = new Crawler(100)
      var entryIP = '212.83.147.166:51235'

      crawler.getCrawl(entryIP).then(function(data) {
        expect(data).to.have.property('start');
        expect(data).to.have.property('end');
        expect(data).to.have.property('entry');
        expect(data).to.have.property('data');
        expect(data).to.have.property('errors');
      })
      .then(done, done);
    });
  });
});
