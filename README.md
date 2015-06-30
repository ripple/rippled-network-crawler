# Rippled Network Crawler

This crawls the ripple network,
via making requests to the /crawl endpoint of each peer it can connect to, 
starting from an entry point. Some peers may know, and publish (perhaps errantly
.. ), the ip associated with a peer, while others don't. We merge the points of
view of each peer, collecting a dict of data, keyed by ip address.

This maps out the connections between all rippled servers (not necessarily UNLS)
who (for the most part) don't even participate in Consensus or at least don't 
have any say in influencing the outcome of a transaction on mainnet. 

## Run crawl.js

Example
``` bash
npm install 
node src/crawl.js 192.170.145.70:51235 --readable
```


```
$DATABASE_URL=postgres://postgres:zxccxz@localhost:5432/crawl
node src/crawl.js --prior --store
```

### Options

* #### < entry ipp >

    Must be in the format `ip:port`
    ```
    node src/crawl.js 192.170.145.70:51235 
    ```

* #### --readable

    Output json with four space indentation.

* #### --selective

    Crawl specified ipps without expanding crawl to peers of each rippled instance.

    Ipps are read from stdin.

    ```
    node src/crawl.js --selective < ipps.txt
    ```

* #### --store

    Stores crawl output into the database.
    
    Database specified by `$DATABASE_URL`.
    
    See [schema](#schema) for details.
    
* #### --prior

    Crawls selectively based on ipps from latest crawl in the database.
    
    Database specified by `$DATABASE_URL`.

* #### --logcrawl

  Log crawl.

* #### --logsql

  Log all sequelize queries and ddl.

* #### $DATABASE_URL

  For example `postgres://postgres:zxccxz@localhost:5432/crawl`

* #### $MAX_CONNECTIONS

  Max number of http requests to have open at once.

  Default is 100.


## Output structure

`crawl.js` outputs a stringified json in the following format:

|   Field    |    Description           | Type   |
|------------|--------------------------|--------|
| start      | Crawl start time         | date   |
| end        | Crawl end time           | date   |
| entry      | Crawl entry ip:port      | string |
| data       | Raw data collected       | array  |
| errors     | Errors                   | array  |

### Example output

```json
    {
        "start" : "2015-06-18T16:48:42-07:00",
        "end" : "2015-06-18T16:48:48-07:00",
        "entry" : "162.217.98.90:51235",
        "data" : [
            {   
                "162.217.98.90:51235" :  response
            },
            {
                "72.251.233.165:51235" : response
            },
            {
                ...
            }
        ],
        "errors" : [
            { "98.167.119.231:51235" : { "code": "ECONNRESET" } },
            { "52.4.169.56:51235" :  { "code": "ECONNREFUSED",
                                       "errno": "ECONNREFUSED",
                                       "syscall": "connect" } 
            },
            ...
        ]
    }
```

Response format described [here](#response).

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

## Info

## Visualize


## /crawl response format <a id="response"></a>

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
