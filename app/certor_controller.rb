require 'ostruct'
require 'json'

class CertorController

  # http://www.restapitutorial.com/lessons/httpmethods.html
  # curl -H 'Content-Type: application/json' -d '{"meno":4}' -X POST -v http://localhost:9292/
  def self.action_post(req)
    return false unless req['CONTENT_TYPE'] == 'application/json'
    body = req['rack.input'].gets
    res = { "req" => JSON.parse(body) }
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
