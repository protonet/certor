#!/usr/bin/env ruby

require 'resolv'
require 'tempfile'

def setup_dns(domain, txt_challenge)
  dns = Resolv::DNS.new;
  acme_domain = "_acme-challenge."+domain;
  # Create output directory for the certs
  Dir.mkdir "certs/#{domain}"

  # Create nsupdate_create tempfile
  nsupdate_create = Tempfile.new('nsupdate_create')
  nsupdate_create.puts("server ns1.geilerserver.com")
  nsupdate_create.puts("zone geilerserver.com")
  nsupdate_create.puts("update add #{acme_domain} 60 TXT #{txt_challenge}")
  nsupdate_create.puts("send")
  nsupdate_create.close

  # Execute nsupdate
  dnskey = 'geilerserver.com.key:"MVptZHq85/irKhnJI+vxm4B6UX1T7NGw0IH2HhvUTBlDE7MVDOutK74E md9lTzmts6ux87uFtEPqVLABo3fkcA=="'
  %x( /usr/bin/nsupdate -y #{dnskey} -v #{nsupdate_create.path})

  resolved = false;
  until resolved
    dns.each_resource(acme_domain, Resolv::DNS::Resource::IN::TXT) { |resp|
     if resp.strings[0] == txt_challenge
       resolved = true;
     end
    }
    if !resolved
     sleep 10; 
    end
  end
end

def delete_dns(domain, txt_challenge)
  acme_domain = "_acme-challenge."+domain;
  # Create nsupdate_delete tempfile
  nsupdate_delete = Tempfile.new('nsupdate_delete')
  nsupdate_delete.puts("server ns1.geilerserver.com")
  nsupdate_delete.puts("zone geilerserver.com")
  nsupdate_delete.puts("update delete #{acme_domain} 60 TXT #{txt_challenge}")
  nsupdate_delete.puts("send")
  nsupdate_delete.close

  # Execute nsupdate
  dnskey = 'geilerserver.com.key:"MVptZHq85/irKhnJI+vxm4B6UX1T7NGw0IH2HhvUTBlDE7MVDOutK74E md9lTzmts6ux87uFtEPqVLABo3fkcA=="'
  %x( /usr/bin/nsupdate -y #{dnskey} -v #{nsupdate_delete.path})
end

if __FILE__ == $0
  hook_stage = ARGV[0]
  domain = ARGV[1]
  txt_challenge = ARGV[3]

  # puts hook_stage
  # puts domain
  # puts txt_challenge

  if hook_stage == "deploy_challenge"
    setup_dns(domain, txt_challenge)
  elsif hook_stage == "clean_challenge"
    delete_dns(domain, txt_challenge)
  end

end
