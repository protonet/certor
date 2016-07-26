#!/bin/bash

DOMAINNAME=$1

echo "Generating Certificate Signing Request for $DOMAINNAME"

openssl genrsa 4096 > $DOMAINNAME.key
openssl req -new -sha256 -key $DOMAINNAME.key -subj "/CN=$DOMAINNAME" > $DOMAINNAME.csr

DATA="curl -H 'content-Type: application/json'"' -d '"'"'{"hostname":"'$DOMAINNAME'","csr":"'$(cat $DOMAINNAME.csr | base64 | tr --delete '\n')'"}'"' -X POST http://localhost:9292/"

echo $DATA

#curl -H 'content-Type: application/json' $DATA -X POST http://localhost:9292/
