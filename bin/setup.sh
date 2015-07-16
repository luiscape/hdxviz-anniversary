#!/bin/bash

#
# Set-up the Python virtual environment for munging.
#
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt

#
# Make sure you have NPM and install server.
#
npm --version
npm intstall http-server -g