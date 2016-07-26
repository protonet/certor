#!/bin/bash

DOMAINNAME=$1

echo "Generating Certificate Signing Request for $DOMAINNAME"

openssl genrsa 4096 > $DOMAINNAME.key
openssl req -new -sha256 -key $DOMAINNAME.key -subj "/CN=$DOMAINNAME" > $DOMAINNAME.csr

CSR_BASE64=$(cat $DOMAINNAME.csr | base64 | tr --delete '\n')
CONTENT_TYPE=" -H 'content-Type: application/json'"

DATAFILE=$(mktemp)
echo '{"hostname":"'$DOMAINNAME'","csr":"'$CSR_BASE64'"}' > $DATAFILE

curl -H 'Content-Type: application/json' -d @$DATAFILE -X POST http://localhost:9292/

rm $DATAFILE
