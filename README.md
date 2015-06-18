# Ripple Network Crawl

## Run

`node misc/crawl.js 192.170.145.70:51235`

## Response

Returns a json with the crawl information

##### JSON structure

|   Field    |    Description           |
|------------|--------------------------|
| start      | Crawl start time         |
| end        | Crawl end time           |
| entry      | Crawl entry ip:port      |
| data       | Raw data collected       |
| errors     | Errors                   |

## Example 
``` javascript
Crawler = require('rippled-network-crawler').Crawler

var crawler = Crawler(100)
crawler.getCrawl("192.170.145.70:51235").then(function(response) {
  console.log(response);
})
.catch(function(error) {
  console.log('error', error)
})
```

## Schema

### crawls

|   Column   |           Type           |
|------------|--------------------------|
| id         | bigint                   |
| start_at   | timestamp with time zone |
| end_at     | timestamp with time zone |
| entry_ipp  | string                   |
| data       | json                     |
| exceptions | json                     |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
