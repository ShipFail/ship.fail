# Makefile for awesome-chatboot
# Author: Huan Li <huan@chatie.io> https://github.com/huan

.PHONY: all
all: clean serve

.PHONY: install
install:
	gem install bundler
	bundle update && bundle install

.PHONY: test
test:
	deno task test

.PHONY: clean
clean:
	rm -fr _site

.PHONY: build
build:
	bundle exec jekyll build --trace

.PHONY: serve
serve:
	bundle exec jekyll serve --incremental
