# [Moved to xpring-eng](https://github.com/xpring-eng/validations-etl)

If you are developing the instance of this project that is used with the [XRP Ledger Explorer](https://livenet.xrpl.org/), please use https://github.com/xpring-eng/rippled-network-crawler

# XRPL Network Crawler

The network crawler looks for all nodes on the XRPL network.  The crawler starts with a single rippled IP address, and queries its `/crawl` endpoint to get other peers connected to it.  All of these nodes are added to the list, and any that also have an IP listed via the endpoint is then queried to find more nodes.  The process is repeated until no new nodes with IP addresses are found.  The interval between network crawls is 2 minutes.  The full results of each crawl are added to the `prod_network_crawls` table, and the data for each node found is used to update the `prod_node_state` table.

#### Geolocation

Nodes from the latest crawl with IP addresses are geolocated every 6 hours.  This data is saved into the `prod_node_state` table.  All the column family `f` values come from the geolocation service.

#### Setup

clone the repo, create a config.json file with the hbase connection details and entry IP, then:
```
$ npm install
$ node index

```

#### HBase Tables

* **prod_network_crawls**
  * rowkey: inverse timestamp
  * columns:
    * d:nodes_count
    * d:connections_count
    * d:nodes
    * d:connections
    * d:start
    * d:end

* **prod_node_state**
  * rowkey: node_pubkey
  * columns:
    * d:pubkey_node
    * d:version
    * d:quorum
    * d:host
    * d:port
    * d:peers
    * d:out
    * d:in
    * d:load_factor
    * d:server_state
    * d:uptime
    * d:hostid
    * d:latency
    * d:ledgers
    * f:location_source
    * f:isp
    * f:long
    * f:lat
    * f:country_code
    * f:country
    * f:timezoneee
    * f:region
    * f:region_code
    * f:postal_code
