#!/usr/bin/env python
from lib.version_crawler import VersionCrawler
import os

version_crawler = VersionCrawler()
version_crawler.crawl(os.environ['RIPPLED_IP_ADDRESS'], os.environ['RIPPLED_PORT'])

for version in version_crawler.versions:
  version_crawler.versions[version] = len(version_crawler.versions[version])

print 'Total nodes: {0}'.format(len(version_crawler.public_keys))
print 'Known versions:'
print version_crawler.versions