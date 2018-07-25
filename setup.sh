#!/bin/sh

# Some setup before executing (Ubuntu 16.04 VM)
apt update
apt install --yes \
  libgtk2.0-0 libgconf-2-4 \
  libasound2 libxtst6 libxss1 libnss3 xvfb

# Start Xvfb
Xvfb -ac -screen scrn 1280x2000x24 :9.0
