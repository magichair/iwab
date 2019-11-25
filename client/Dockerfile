FROM mhart/alpine-node:12
WORKDIR /app
COPY yarn.lock package.json ./
RUN yarn install --prod

# Only copy over the node pieces we need from the above image
FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=0 /app .
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]