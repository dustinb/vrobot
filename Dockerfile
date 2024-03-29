FROM node

# Create app directory
WORKDIR /usr/src/app

# ffmpeg and melt
RUN apt-get update
RUN apt-get install -y ffmpeg melt curl

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY *.js ./
COPY defaults.yaml ./
CMD [ "node", "lazyvid.js" ]