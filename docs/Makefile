# Makefile for awesome-chatboot
# Author: Huan Li <huan@chatie.io> https://github.com/huan

.PHONY: all
all: clean serve

.PHONY: install
install:
	gem install bundler
	bundle update && bundle install

.PHONY: dev
dev: clean serve

.PHONY: clean
clean:
	rm -fr _site

.PHONY: build
build:
	bundle exec jekyll build --trace

.PHONY: serve
serve:
	bundle exec jekyll serve --incremental

.PHONY: test
test:
	deno task test
