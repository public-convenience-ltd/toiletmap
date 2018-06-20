FROM node:10

# Create app directory
WORKDIR /gbptm
COPY . .
RUN yarn --pure-lockfile
WORKDIR /gbptm/packages/server
EXPOSE 8080
CMD ["yarn", "start"]
