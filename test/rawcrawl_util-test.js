var promise = require('chai').expect
var assert = require('chai').assert
var expect = require('chai').expect
var _ = require('lodash');
var rc_util = require('../misc/rawcrawl_util.js');

var invalid_crawl = require('./data/invalid_crawl.json');
var valid_crawl = require('./data/valid_crawl.json');

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
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
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
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
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
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getVersions(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getLocations()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getLocations(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getLocations(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
  describe('#getDegrees()', function() {
    it("Shouldn't throw an error when given valid crawl data", function() {
      rc_util.getDegrees(valid_crawl.data);
    });
    it("Should throw an error when given invalid crawl data", function() {
      expect(function () { rc_util.getRippleds(invalid_crawl.data);}).to.throw(Error);
    });
    it("Should return an object", function() {
      var obj = rc_util.getDegrees(valid_crawl.data);
      expect(obj).to.be.an('object');
    });
  });
});
