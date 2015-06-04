import os
from crawler import Crawler

class TestCrawler(Crawler):
  def __init__(self):
    super(TestCrawler, self).__init__()
    self.versions = {}

  def process_node(self, node, hops):
    if 'ip' in node:
      print node['ip']