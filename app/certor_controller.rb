require 'ostruct'
require 'json'
require 'tempfile'
require 'base64'
require 'shellwords'

class CertorController

  def self.get_subject(path)
    out = %x( ls -l #{path} )
    %x( openssl req -subject -noout -in #{Shellwords.escape(path)} ).lines.each do |line|
      if line.strip =~ /^subject=\/CN=(.*)$/
        return $1
      end
    end
    return ""
  end

  # http://www.restapitutorial.com/lessons/httpmethods.html
  # curl -H 'Content-Type: application/json' -d '{"meno":4}' -X POST -v http://localhost:9292/
  # curl -H 'Content-Type: application/json' -d '{"hostname":"localhost.ssl","csr":"$(cat ssl/server.csr | base64 | tr --delete '\n')"}' -X POST http://localhost:9292/
  def self.action_post(req)
    return false unless req['CONTENT_TYPE'] == 'application/json'
    body = req['rack.input'].gets
    res = { "req" => JSON.parse(body) }
    # The CSR is base64 encoded inside the json
    # Restore the original CSR to a Tempfile
    #puts ">>>>#{res['req']['csr']}<<<<"
    csr = Tempfile.new(res['req']['hostname'])
    csr.write(res['req']['csr'])
    csr.close
    # Want to see if the CSR matches the Hostname
    unless get_subject(csr.path) == res['req']['hostname']
      return [500, {
        'Content-Type' => 'application/json'
      }, [
        {"error" => "CSR Subject #{get_subject(csr.path)} does not match hostname #{res['req']['hostname']}"}.to_json
        ]
      ]
    end
    # TODO: Have a function to send signed request to the acme-api for getting the Challenge Token
    #puts %x( env )
    #puts %x( pwd )
    # staging CA="https://acme-staging.api.letsencrypt.org/directory"
    cert = %x( ./letsencrypt/letsencrypt.sh --signcsr #{csr.path} --challenge dns-01 --domain #{res['req']['hostname']} --hook ./manual_hook.rb 2>&1 )
    unless $? == 0
      return [500, {
        'Content-Type' => 'application/json'
      }, [
        {"error" => "got an error:#{cert}"}
        ]
      ]
    end
    #puts cert.inspect
    # Cleanup
    csr.unlink
    [200, {
      'Content-Type' => 'application/json'
    }, [{
      "hostname" => res['req']['hostname'],
      "csr" => res['req']['csr'],
      "cert" => cert
    }.to_json]]
  end

  def self.action_delete(req)
    [200, {}, ['KTHXBY']]
  end

  def self.action_put_nsupdate(req)
    [200, {}, ['*Purrrrr*']]
  end

  def self.invalid(req)
    [404, {}, ['I can not do this, Dave']]
  end

  def self.call(req)
    url = req['REQUEST_PATH']
    method = req['REQUEST_METHOD'].downcase
    action = if url == "/"
      "action_#{method}"
    else
      "action_#{method}_#{url[1..-1]}"
    end
    if respond_to?(action)
      ret = send(action, req)
      return ret if ret
    end
    invalid(req)
  end
end
