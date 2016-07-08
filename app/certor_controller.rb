require 'ostruct'
require 'json'
require 'tempfile'

class CertorController

  # http://www.restapitutorial.com/lessons/httpmethods.html
  # curl -H 'Content-Type: application/json' -d '{"meno":4}' -X POST -v http://localhost:9292/
  # curl -H 'Content-Type: application/json' -d '{"hostname":"localhost.ssl","csr":"-----BEGIN CERTIFICATE REQUEST-----MIIEuzCCAqMCAQAwdjELMAkGA1UEBhMCREUxEDAOBgNVBAgMB0hhbWJ1cmcxEDAOBgNVBAcMB0hhbWJ1cmcxFjAUBgNVBAoMDVByb3RvbmV0IEluYy4xEzARBgNVBAsMCk9wZXJhdGlvbnMxFjAUBgNVBAMMDWxvY2FsaG9zdC5zc2wwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQClM0ZXYQZqKAxmlEPcX7Yl5qTzmOmhrQ+3MN490YH28s+KvZnDcd0YuMWhnBSueT+1C8Ub5HgrcMjBVEYRrpdPZsWpLIFc6lDFiByfgcFSF/Uc5HxY8ukTTh5iJSyuDHOQ5/hMYgfvuOg3Y/085oGlNsiQaBrh9P8vBqEueJV/VzXyAaaEei3CpWu6f7Km2iUBKJ9HKbhklPbNsQsjfgRgFQzzXQKaJ0g72+bemC7HX4Qf+Me91Zj1jZqh8oz2GiVHtbqmJq7NXGCsqzMd4rD73ek1UtNjdf/+hzNygI+VtZnvAmpkXiSsgI/QqoWmjG/HdEhF3sjXhXuDJoREUHO8b3iuFcamtARyTAK6QkMNe+lf9oGOuxalOamGf80u83T6vpXZndHJtfj4/OIhI+5dpINmZAlRbEaTYx7Bnm50kdaLVmEw647tZ4IG/Pm2K5Byg5drEv46F41/aGpasiqWlzd/JHQFjcSc+rFiPkkbCC908COYqvWFgmN0pC6aPQYyK2kXd4iAw+97Wmao4mQmkt4VozOSvpDyFfYlxnQphyTE9sHIKazonQKBp7N8v5UxIbyV2u0du+hnLHnSdhEQzmg0hJXBtLMHUFpEOupERAqtnoaFItz6LziyYwqAnb9vSNZT1HUeNQa4pig4kLmoxu8BzPEqSnQWILnUvl2SwQIDAQABoAAwDQYJKoZIhvcNAQELBQADggIBABZNYhK9BSxWcWzd7QEXtCWXYS76gKRxeRZxYDrkJVxo0pVleJ2DhQghStN157TRRQCcVuooNUvKcLPtqOVh8qodqedUsTgOLPHwSC4wHYBwhesF43t9JZbePJZN0bAiaaxC+mi7/fDe25uzMmENjFPMcjXkSLbE9vQ3+z6CW47MvqCByhbUJs0vVdghKfNgEnvNncxr63Al7JmnbJttECkpK+Z3ItOBBtAkOHVeYgKIt/pAlo9eo0RcDI/BFB8ZycoLdGj7ifm68ZajW53aJ1svJB7bmmLlk23dubxGQNKIkw7il6vSVs3/fflVYCV6lSyDDlEkQobgrXDr/9Yge2Xua0JS+iy5euHZ6ptuxwprr6yKlSwOYW0g2UzdGSba6sx7HmHWKxleNJh7TvUeJis4M0dLKoDZcxSXacvpL+jNcWiUGAoWYL+EkWHeBBt6pbyKx+eYBaaSVVFDCvHF4HFzXjatK7UAc00ISWjgohUiXB9hephPKO8IXV3419Qz3UPECOW4ubPA3c2Yqyg4xtKGWo0qvS0ESDyHZ2uZtaU17nhw5W6FG8/cDXG4R++rZ+VCgZV0QOtrApPnx8Cq0DZvYdJg9HbOzeDhsyAlW8YE3w4lAD/1Q8ov9YqVH14SrM0JPoaxzKIV+vQA/Ht8KM7IzPbKnpxe8lKuxbTb156g-----END CERTIFICATE REQUEST-----"}' -X POST http://localhost:9292/
  def self.action_post(req)
    return false unless req['CONTENT_TYPE'] == 'application/json'
    body = req['rack.input'].gets
    res = { "req" => JSON.parse(body) }
    #crs = Tempfile.new(res['req']['hostname'])
    #crs.write(res['req']['csr'])
    #crs.close
    #puts crs.inspect
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
