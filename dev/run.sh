#!/usr/bin/env bash

source "dev/$1.sh";
node -e "require('./src/gcs').writeToGcs('./dev/mock-artifacts')";
