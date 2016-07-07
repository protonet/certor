require "test/unit"
require_relative '../app/certor_controller.rb'

class TestCertorController < Test::Unit::TestCase
  class RackInput
    attr_reader :gets
    def initialize(_gets)
      @gets = _gets
    end
  end
  def test_action_create
    res = CertorController.action_create({
      "REQUEST_METHOD" => "POST",
      "CONTENT_TYPE" => "application/json",
      "rack.input" => RackInput.new(JSON.generate({"Hello"=>"World"}))
    })
    assert_equal(200, res[0])
    assert_equal('application/json', res[1]['Content-Type'])
    assert_equal('{"req":{"Hello":"World"}}', res[2][0])
  end
end
