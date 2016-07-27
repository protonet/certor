require 'test/unit'
require_relative '../config.rb'

class TestConfig < Test::Unit::TestCase

YAML =<<YAML
dns:
  domain : geilerserver.com
  key : der-key
  host : ns1.geilerserver.com
YAML


  def test_dns_config
    cfg = Config.from_string(YAML)
    assert_equal(cfg.dns.domain, "geilerserver.com")
    assert_equal(cfg.dns.key, "der-key")
    assert_equal(cfg.dns.host, "ns1.geilerserver.com")    
  end

end
