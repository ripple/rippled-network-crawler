# Rippled Network Crawler

This crawls the ripple network,
via making requests to the /crawl endpoint of each peer it can connect to, 
starting from an entry point. Some peers may know, and publish (perhaps errantly
.. ), the ip associated with a peer, while others don't. We merge the points of
view of each peer, collecting a dict of data, keyed by ip address.

This maps out the connections between all rippled servers (not necessarily UNLS)
who (for the most part) don't even participate in Consensus or at least don't 
have any say in influencing the outcome of a transaction on mainnet. 

## Run

``` bash
npm install 
node misc/crawl.js 192.170.145.70:51235
```

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

##### Example crawl

###### top level structure

```json
    {
        "start" : "2015-06-18T16:48:42-07:00",
        "end" : "2015-06-18T16:48:48-07:00",
        "entry" : "162.217.98.90:51235",
        "data" : [
            {   
                "162.217.98.90:51235" :  { response }
            },
            {
                "72.251.233.165:51235" : { response }
            },
            {
                ...
            }
        ],
        "errors" : [
            { "98.167.119.231:51235" : "ECONNREFUSED" },
            { "52.4.169.56:51235" : "ETIMEDOUT" },
            ...
        ]
    }
```

###### response

```json
    {
      "overlay" : {
        "active"  : [
          ...
        ]
      }
    }
```


## Example Usage

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

## /crawl response format

As of the time of writing, there were various versions of rippled on the network
and not all of them return information formatted in the same way, so some
normalisation must be done. Also, some fields aren't always published (like in
the case of `ip`). The public_key is returned in base64, so to match public keys
encoded in base58 and saved as a string elsewhere, they must be normalised.

The top level structure of the response is as so:

```json
    {
      "overlay" : {
        "active"  : [
          ...
        ]
      }
    }
```

And there are various forms for each element (connected peer) in `active`:

* With `"ip"` and `"type" : "in"`
```json
    {
      "ip": "24.234.130.12",
      "public_key": "A2JwZ1y3iHno7/faxWfuhLF1skYPhMeLgURxyUzLT93B",
      "type": "in",
      "version": "rippled-0.28.0-b21"
    },
```

* With `"ip"` and `"type" : "out"` and `"port"`
```json
    {
      "ip": "54.186.73.52",
      "port": "51235",
      "public_key": "AjikFnq0P2XybCyREr2KPiqXqJteqwPwVRVbVK+93+3o",
      "type": "out",
      "version": "rippled-0.28.0-rc3"
    },
```

* With `"ip"` and `"type": "peer``
  * Without a port packed in `ip`, the `type` is actually `"in"`
```json
    {
      "ip": "54.164.144.101",
      "public_key": "A8vPtayIaLdyV/2gLkWigyr1vwK2qqrre8ABRh2sXmMT",
      "type": "peer",
      "version": "rippled-0.28.0"
    },
```

* With `"ip"` (with a port)  and `"type": "peer``
  * With a port packed in `ip`, the `type` is  `"out"`
```json
    {
      "ip": "23.239.3.247:51235",
      "public_key": "An366bc/eRsF01nmfnz6j2JnBA7gpSr7BCVygePEoWgs",
      "type": "peer",
      "version": "rippled-0.28.1-b5"
    },
```

* With only `"public_key"" to identify node.

  * Unfortunately we don't know the direction of the connection in these cases
    but sometimes we have the direction information from another peers
    perspective. We may also have the ip from another peers POV.
```json
    {
      "public_key": "An2mhwWHnwzBehh88G+vpwwwqviFAqMl9rjU2PnDELr9",
      "type": "peer",
      "version": "rippled-0.28.0-rc3"
    },
```

## Save to postgres

### Run

`node misc/crawl_db.js 192.170.145.70:51235 postgres://postgres:zxccxz@localhost:5432/crawl`

### Settings (just set/unset env vars)

Boolean flags, set true by presence of environment variable:

* DROP_TABLES
  * Clear the database when connecting, and sync the tables

* LOG_SQL
  * Tell sequelize to log verbosely all queries and ddl

* LOG_CRAWL
  * Log crawl

## Schema

### crawl

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


## Visualize

``` bash
npm install 
npm install -g http-server
node misc/crawl.js 192.170.145.70:51235 -r > misc/crawls/crawl.json
node misc/graphify.js misc/crawls/crawl.json > misc/crawls/graph.json
cd misc/
http-server -o
```
