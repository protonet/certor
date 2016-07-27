require 'yaml'
require 'ostruct'

class Config
  attr_reader :dns

  def initialize(config)
    @config = config
    @dns = OpenStruct.new(@config['dns'])
  end

  def self.from_string(val)
    Config.new(YAML.load(val))
  end

  def self.from_file(fname)
    from_string(IO.read(fname))
  end

end
