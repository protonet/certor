#!/bin/bash

# this script takes care of all system depenencies of certor

OPENSSL_BIN=$(which openssl)
NSUPDATE_BIN=$(which nsupdate)
RUBY_BIN=$(which ruby)
GEM_BIN=$(which gem)
BUNDLE_BIN=$(which bundle)
GIT_BIN=$(which git)

if [ -z $OPENSSL_BIN ]; then
	echo "openssl is not installed"
	echo "For Debian: sudo apt-get install openssl"
	exit 2
fi
if [ -z $NSUPDATE_BIN ]; then
	echo "nsupdate is not installed"
	echo "For Debian: sudo apt-get install dnsutils"
	exit 2
fi
if [ -z $RUBY_BIN ]; then
	echo "ruby is not installed"
	echo "For Debian: sudo apt-get install ruby ruby-dev build-essential"
	exit 2
fi
if [ -z $GEM_BIN ]; then
	echo "gem is not installed"
	echo "For Debian: This should come with ruby ... what have you done?"
	exit 2
fi
if [ -z $BUNDLE_BIN ]; then
	echo "bundle is not installed"
	echo "For Debian: sudo apt-get install bundle"
	exit 2
fi
if [ -z $GIT_BIN ]; then
	echo "git is not installed"
	echo "For Debian: sudo apt-get install git"
	exit 2
fi

# Get the letsencrypt.sh if not present
if [ ! -d "letsencrypt" ]; then
	mkdir letsencrypt
	git clone https://github.com/lukas2511/letsencrypt.sh.git letsencrypt/
fi

# Check the ruby version
# unclear which version MUST be used, TODO

# Set up the ruby environment properly
gem install bundle
gem install puma
bundle install
echo ""
echo "Start the Server with the command: puma"
echo ""
