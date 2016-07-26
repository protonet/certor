require "test/unit"
require_relative '../app/certor_controller.rb'

class TestCertorController < Test::Unit::TestCase
    KEY = <<KEY
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
KEY
    CSR = <<CSR
-----BEGIN CERTIFICATE REQUEST-----
MIIEWTCCAkECAQAwFDESMBAGA1UEAxMJbWVuby50ZXN0MIICIjANBgkqhkiG9w0B
AQEFAAOCAg8AMIICCgKCAgEA7RbVO0+oc4uzy+VRw+qMfOR2zejhZeh3HnepHg9H
TI7uE8W5aCYgTpkKd09lLpMliAX7PEunBK2ok3byohQvZS0UM5/KfNyvHoXKlVqQ
FZWUr+uJMrB1xuKyxrunLPBlRvEBdUBLHDBLHRg64YGUFCUF0Ep6ItMuo99pLhHz
BvU0zbuqeqWJVjHTF5dmPplbO33mSTmW6kOQFui+SRFMap9avXRYc+4IC40MuJdP
n+Ss024bxJwYvDtNoqfkq6Xv10OoNNtDwnWF2vrMnWdNCtH7CJlRG8do0a0pE27L
uQqY+1LG/BOCNbVw+Ymm1d/Vggu9Q8+DCck1b/YEZbwaIDKMZ4QpEowjTF4LfWA0
a+9FKfDDQSWa6GQ9OyZ7flMz23RM+NtMABWDgZ8lit4no/kk/e43V/OrZYtywjFG
+AYvaUnxrbrBWCah5FR6pSDVd2bO0UfQXtBZih//od2l8wSA3s2/hqamxMpya9Z5
8fTZbQOx2gajR3KsQO1evJFhYDRLP6+Gu/hQwCkN08fO1nSfeIUhfMGg8APoXmqT
jtACie7gvrbUgmZxlixqY+hR7vItLc06bTkZpzhJ9LlfCWKafXvUdle39SpJh61R
1+QxSRKb0CPcPPE4t4FNcQQN+/SrPKFqo1NDliOuuy6RgM2i2AerDjJS4Lz+jwIs
V5MCAwEAAaAAMA0GCSqGSIb3DQEBCwUAA4ICAQC8rE5pugaMpBsKYu+x0K2cak3g
pS0HW2wUzYjhfuwp75TPED9gjSb11Vc0VPxe1885XahF7Wu0nhvRbqTQQcCyVgwg
tHRBdH7YrU21NrkecnQ1B8LdNll43SD1wpIL+d7ylZg+p+FaINE6KRjsxNXIeaGd
0GWN2Mr5mgE7gqUNbxdrYgSL4i/Pd9FxicJOn2DrX8x9VdmzMFO3HNbDQnqO3zJX
Z5tGzoZ+lJidqTauTqPbv3q+WpnhXcRJRzbKgqbJ3fnZgX5XAM9zzgtmF/TxenT1
jcVdL318hUPdw5HmuwGYM3R87Ozi151qr0JE1bgq4armzVoJUR1N/Y//9REM1Hy6
zwlNp4M52p1hP19ZlQBYdO6eAgWlvx4SsqAkpa2cuKuz6ff32gm699bl7r0gy/MF
cJbWXIveWU+dldas+0bq1ngdZ++tFk9jW57rjncrQCDC9Bhg5ZDlG3QFTrXM0D6F
8k7BDT3k94mwjTgmEteM0GFz3s8UThHeOWi43feQ9Rv8zuK5MnbJJUICunv/mMDH
POUUooPWt3n1Cq+3PeDSN+xEH/japd/2bCHt3DPS8nFaI004fP5lUwIffiwF+XOb
iNtTeX7I5SGmMGmejbQwIKXcQePm46UQ7RSFzI0xjaGsZP4E8BY73XzomUi4NM/Z
RzG24AGvfb6AVpC4hQ==
-----END CERTIFICATE REQUEST-----
CSR

  class RackInput
    attr_reader :gets
    def initialize(_gets)
      @gets = _gets
    end
  end
  def test_hostname_missmatch
    res = CertorController.action_post({
      "REQUEST_METHOD" => "POST",
      "CONTENT_TYPE" => "application/json",
      "rack.input" => RackInput.new(JSON.generate({
        "hostname" => "meno.kaputt",
        "csr" => CSR
      }))
    })
    assert_equal(500, res[0])
    assert_equal('application/json', res[1]['Content-Type'])
    result = JSON.parse(res[2].first)
    assert_equal(result['error'], "CSR Subject meno.test does not match hostname meno.kaputt");
  end

  def test_action_post
    res = CertorController.action_post({
      "REQUEST_METHOD" => "POST",
      "CONTENT_TYPE" => "application/json",
      "rack.input" => RackInput.new(JSON.generate({
        "hostname" => "meno.test",
        "csr" => CSR
      }))
    })
    puts res.inspect
    assert_equal(200, res[0])
    assert_equal('application/json', res[1]['Content-Type'])
    result = JSON.parse(res[2].first)
    assert_equal(result['hostname'], "meno.test")
  end
end
