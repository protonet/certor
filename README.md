# certor

[![Build Status](https://travis-ci.org/protonet/certor.svg?branch=master)](https://travis-ci.org/protonet/certor)

A Webservice that handles Letencrypt Certificate Requests via DNS

## start
> puma

## installation

#### Prerequisites

**Openssl**
> sudo apt-get install openssl

**Letsencrypt.sh** 
Website: https://github.com/lukas2511/letsencrypt.sh
> git clone https://github.com/lukas2511/letsencrypt.sh.git letsencrypt/
> git clone https://github.com/jbjonesjr/letsencrypt-manual-hook.git letsencrypt/hooks/manual/

**account.key** 
> openssl genrsa 4096 > assets/account.key

test
  ruby test/test_certor_controller.rb
