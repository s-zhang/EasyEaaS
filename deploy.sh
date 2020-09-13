#!/bin/sh

echo 1

TARGET=szh10000@stevenzps.duckdns.org
KEY_FILE=./selfhost
HOME_DIR=/home/szh10000
TARGET_DEPLOY_DIR=$HOME_DIR/deploy/EasyEaaS
SOURCE_DIR=./dist

echo 2
ssh $TARGET -i $KEY_FILE "cd $HOME_DIR/docker && (docker-compose down easyeaas || true)"
echo 3
ssh $TARGET -i $KEY_FILE "rm -rf $TARGET_DEPLOY_DIR || true"
echo 4
ssh $TARGET -i $KEY_FILE "mkdir $TARGET_DEPLOY_DIR"
echo 5
scp -r -i $KEY_FILE $SOURCE_DIR/* $TARGET:$TARGET_DEPLOY_DIR
echo 6
ssh $TARGET -i $KEY_FILE "cd $HOME_DIR/docker && docker-compose up easyeaas"
