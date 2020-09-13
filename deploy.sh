#!/bin/sh

TARGET=szh10000@stevenzps.duckdns.org
KEY_FILE=./selfhost
HOME_DIR=/home/szh10000
TARGET_DEPLOY_DIR=$HOME_DIR/deploy/EasyEaaS
SOURCE_DIR=./dist

ssh $TARGET -i $KEY_FILE "cd $HOME_DIR/docker && (docker-compose down easyeaas || true) && (rm -rf $TARGET_DEPLOY_DIR || true) && mkdir $TARGET_DEPLOY_DIR"
scp -r -i $KEY_FILE $SOURCE_DIR/* $TARGET:$TARGET_DEPLOY_DIR
ssh $TARGET -i $KEY_FILE "cd $HOME_DIR/docker && docker-compose up easyeaas"