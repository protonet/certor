# certor

[![Build Status](https://travis-ci.org/protonet/certor.svg?branch=master)](https://travis-ci.org/protonet/certor)

A Webservice that handles Letencrypt Certificate Requests via DNS

## installation

#### Prerequisites

**Openssl**  
> sudo apt-get install openssl

**Nsupdate**  
> sudo apt-get install dnsutils

**Ruby**  
> sudo apt-get install ruby ruby-dev build-essential

**Bundle**  
> sudo gem install bundle

**Git**  
> sudo apt-get install git

**Letsencrypt.sh**  
Website: https://github.com/lukas2511/letsencrypt.sh


#### Server Installation

> adduser certor  
Continue as this user  
> mkdir /opt/puma  
> cd /opt/puma  
> git clone https://github.com/protonet/certor.git .  
> mkdir letsencrypt  
> git clone https://github.com/lukas2511/letsencrypt.sh.git letsencrypt/  
> cp assets/certor.systemd.service /etc/systemd/system/certor.service  
Continue as root  
> systemctl enable certor.service  
> systemctl start certor  
  
**account.key** 
> openssl genrsa 4096 > assets/account.key

test
  ruby test/test_certor_controller.rb
