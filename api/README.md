# Proxy API for now.sh

Now.sh will automatically transform files in the api folder in the root of a package to serverless functions and mount them at /api

This works in deploymetns and also when working locally with `now dev` - which is very convenient.

We only have one api route and we prefer to keep code under `/src` so this proxy just exports and runs starts the Apollo server from `/src/api`
