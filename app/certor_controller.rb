require 'ostruct'
require 'json'
require 'tempfile'
require 'base64'

class CertorController

  # http://www.restapitutorial.com/lessons/httpmethods.html
  # curl -H 'Content-Type: application/json' -d '{"meno":4}' -X POST -v http://localhost:9292/
  # curl -H 'Content-Type: application/json' -d '{"hostname":"localhost.ssl","csr":"$(cat ssl/server.csr | base64 | tr --delete '\n')"}' -X POST http://localhost:9292/
  def self.action_post(req)
    return false unless req['CONTENT_TYPE'] == 'application/json'
    body = req['rack.input'].gets
    res = { "req" => JSON.parse(body) }
    # The CSR is base64 encoded inside the json
    # Restore the original CSR to a Tempfile
    csr = Tempfile.new(res['req']['hostname'])
    plain = Base64.decode64(res['req']['csr'])
    csr.write("#{plain}")
    csr.close
    # Want to see if the CSR matches the Hostname
    # TODO: Put this in a function
    csr_subject = %x( openssl req -subject -noout -in '#{csr.path}' | sed -n '/^subject/s/^.*CN=//p' ).delete!("\n")
    if csr_subject.to_s == res['req']['hostname'] then
      puts 'Congrats! Your Domainname matches the CSR Subject'
    else
      raise ("CSR Subject #{csr_subject.inspect} does not match hostname #{res['req']['hostname'].inspect}")
    end
    # TODO: Have a function to send signed request to the acme-api for getting the Challenge Token

    # Cleanup
    csr.unlink
    [200, {
      'Content-Type' => 'application/json'
    }, [JSON.generate(res)]]
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
