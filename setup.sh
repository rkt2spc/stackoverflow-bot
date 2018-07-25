#!/bin/sh

# Some setup before executing (Ubuntu 16.04 VM)
apt update
apt install --yes \
  libgtk2.0-0 libgconf-2-4 \
  libasound2 libxtst6 libxss1 libnss3 xvfb

# Start Xvfb
Xvfb -ac -screen scrn 1280x2000x24 :9.0
export DISPLAY=:9.0

######################################
# Configurable environment variables #
######################################
# Reporting Config
export REPORT_TO_EMAIL='<fill-me>'

# StackOverflow Config
export STACKOVERFLOW_EMAIL='<fill-me>'
export STACKOVERFLOW_PASSWORD='<fill-me>'

# SMTP Config
export SMTP_HOST='<fill-me>'
export SMTP_PORT='<fill-me>'
export SMTP_USERNAME='<fill-me>'
export SMTP_PASSWORD='<fill-me>'
