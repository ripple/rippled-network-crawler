# XRPL Network Crawler

The network crawler looks for all nodes on the XRPL network.  The crawler starts with a single rippled IP address, and queries its `/crawl` endpoint to get other peers connected to it.  All of these nodes are added to the list, and any that also have an IP listed via the endpoint is then queried to find more nodes.  The process is repeated until no new nodes with IP addresses are found.  The interval between network crawls is 2 minutes.  The full results of each crawl are added to the `crawls` table.

#### Geolocation

Nodes from the latest crawl with IP addresses are geolocated every 24 hours.  This data is saved into the `location` table.

#### Setup

Clone the repo, create a `config.json` file (refer to `example-config.json`). Enter your PostgreSQL connection details and entry IP, then:
```
$ npm install
$ node setup <--- db initialization
```

Then run the service with `$ node index`

#### DB Tables

* **crawls**
  * start
  * end
  * nodes_count
  * connections_count
  * nodes
  * connections

* **location**
  * pubkey
  * ip
  * updated
  * location_source
  * long
  * lat
  * continent
  * country_code
  * country
  * region
  * city
  * postal_code
  * region_code
  * country_code
  * timezone
  * org
  * domain
  * isp
