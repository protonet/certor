class Certor
  def create(env)
    [200, {}, [env['rack.input'].inspect]]
  end
  def delete
    [200, {}, ['KTHXBY']]
  end
  def nsupdate
    [200, {}, ['*Purrrrr*']]
  end
  def invalid
    [500, {}, ['I can not do this, Dave']]
  end
end

class CertorController
  def self.call(env)
    #puts env.inspect
    #puts env['QUERY_STRING']
    #puts input.inspect
    if env['REQUEST_PATH'] == '/create'
      Certor.new.create(env)
    elsif env['REQUEST_PATH'] == '/delete'
      Certor.new.delete
    elsif env['REQUEST_PATH'] == '/nsupdate'
      Certor.new.nsupdate
    else
      Certor.new.invalid
    end
  end
end


