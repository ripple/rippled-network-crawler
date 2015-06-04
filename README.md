# Ripple Network Crawl

Python script that recursively hits the rippled /crawl endpoint to discover all connected peers.

```sh
RIPPLED_IP_ADDRESS=s1.ripple.com RIPPLED_PORT=51235 python main.py
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
| crawl_id        | bigint (crawls.id fk)  |
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
| crawl_id | bigint (crawls.id fk) |
| from     | bigint (peers.id fk) |
| to       | bigint (peers.id fk) |


