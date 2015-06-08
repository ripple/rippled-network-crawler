Crawler = require('../src/crawl.js').Crawler

var c = Crawler(100)
c.crawlResp("s1.ripple.com").then(function(result) {
  return res.send(result);
})
.catch(function(error) {
  console.log('error', error)
})