#!/usr/bin/env python
from lib.version_crawler import VersionCrawler
from lib.test_crawler import TestCrawler
from lib.print_crawler import PrintCrawler
import os

r_ip = os.environ['RIPPLED_IP_ADDRESS']
r_port = os.environ['RIPPLED_PORT']

## Version Crawler
'''
version_crawler = VersionCrawler()
version_crawler.crawl(r_ip, r_port)

for version in version_crawler.versions:
  version_crawler.versions[version] = len(version_crawler.versions[version])

print 'Total nodes: {0}'.format(len(version_crawler.public_keys))
print 'Known versions:'
print version_crawler.versions
'''

## Test Crawler
'''
test_crawler = TestCrawler()
test_crawler.crawl(r_ip, r_port)
'''

## Print Crawler

print_crawler = PrintCrawler()
print_crawler.crawl(r_ip, r_port)