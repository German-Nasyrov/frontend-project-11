develop:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

production:
	rm -rf dist
	NODE_ENV=production npx webpack