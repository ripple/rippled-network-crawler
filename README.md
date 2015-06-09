# Ripple Network Crawl

## Run

`node test/test.js s1.ripple.com`

## Test 
``` javascript
Crawler = require('../src/crawl.js').Crawler

var c = Crawler(100)
c.crawlResp("s1.ripple.com").then(function(result) {
  return res.send(result);
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
| entry_ip   | character varying        |
| entry_port | integer                  |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### peers

|     Column      |          Type          |
|-----------------|------------------------|
| id              | bigint                 |
| crawl_id        | bigint (crawls.id)     |
| reqest_id       | bigint                 |
| public_key      | character              |
| hops_from_entry | integer                |
| reachable       | boolean                |
| version         | character              |
| ip              | character              |
| port            | integer                |
| city            | character              |
| country         | character              |
| region          | character              |

### requests

|     Column      |          Type          |
|-----------------|------------------------|
| id              | bigint                 |
| requested_at    | timestamp with time zone|
| response_time   | integer                |
| raw_data        | character              |

### edges

|  Column  |  Type   |
|----------|---------|
| directed | boolean |
| id       | bigint  |
| crawl_id | bigint (crawls.id) |
| from     | bigint (peers.id) |
| to       | bigint (peers.id) |


### summary

|     Column      |          Type          |
|-----------------|------------------------|
| crawl_id        | bigint (crawls.id)     |
| vert_count      | integer                |
| diameter        | integer                |
| elapsed_time    | integer                |
| node_count      | integer                |
| avg_in_degree   | integer                |
| avg_out_degree  | integer                |
| debug_count     | integer                |
| version_count   | integer                |
| private_count   | integer                |
| max_instances   | integer                |
| ¿distinct public keys per unique IP? | integer |
| ¿unique_port_count?     | integer         |
