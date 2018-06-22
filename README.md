# Rippled Network Crawler

This crawls the ripple network,
via making requests to the /crawl endpoint of each peer it can connect to,
starting from an entry point. Some peers may know, and publish (perhaps errantly
.. ), the ip associated with a peer, while others don't. We merge the points of
view of each peer, collecting a dict of data, keyed by ip address.

This maps out the connections between all rippled servers (not necessarily UNLS)
who (for the most part) don't even participate in Consensus or at least don't
have any say in influencing the outcome of a transaction on mainnet.


### crawl

|   Column          |           Type            |
|-------------------|---------------------------|
| start             | timestamp UTC             |
| end_at            | timestamp UTC             |
| nodes             | topology nodes found      |
| connections       | connections between nodes |
| nodes_count       | # of nodes                |
| connections_count | # of connections          |

### Example output

```json
{
  "nodes": [
    {
      "host": "169.44.60.105",
      "in": 49,
      "out": 29,
      "pubkey_node": "n9LKATbwprxwHPuQpJC2oJjkKZXHPaCjHUskDSBgvDTrTWQLnMwr",
      "hostid": "BRAG",
      "server_state": "full",
      "ledgers": "32570-39565885",
      "latency": 1,
      "load_factor": 1,
      "peers": 78,
      "quorum": 12,
      "version": "1.0.1",
      "uptime": 582223,
      "done": true
    }
  ],
  "connections": [
    "n9LKATbwprxw>n9KcmEKTW3gg",
    "n9LKATbwprxw>n9MGChK9EgiC",
    "n9LKATbwprxw>n9LMyDmtyYEA",
    "n9LKATbwprxw>n9MHTnqzvyRn"
  ],
  "nodes_count": 22,
  "connections_count": 345,
  "end": "2018-06-22 16:00:27.575Z",
  "start": "2018-06-22 16:00:13.413Z"
}
```