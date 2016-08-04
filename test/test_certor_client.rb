
require 'json'
require 'net/http'


puts ARGV.inspect
uri = URI(ARGV[2]||'http://localhost:9292/')
res = Net::HTTP.start(uri.hostname, uri.port) do |http|
  req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  req.body = JSON.generate( {
    :hostname => ARGV[0],
    :csr => IO.read(ARGV[1])
  })
  res = http.request(req)
  puts res.inspect
  puts res.body
end
