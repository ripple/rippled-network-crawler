import os
from crawler import Crawler

class PrintCrawler(Crawler):
  def __init__(self):
    super(PrintCrawler, self).__init__()
    self.versions = {}

  def process_node(self, node, hops):
    if 'ip' in node:
      print node['ip']