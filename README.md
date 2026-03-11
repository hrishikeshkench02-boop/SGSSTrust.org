# SGSSTrust.org
# SGSS Trust Website

Official website for Sai Gokula Seva Samsthe.

## Requirements
- Node.js (v18 or higher recommended)

## Installation

Clone the repository:

git clone https://github.com/hrishikeshkench02-boop/SGSSTrust.org.git

Go into the folder:

cd SGSSTrust.org

Install dependencies:

npm install

Run the server:

node server.js

The website will run at:

http://localhost:3000


## Admin Dashboard

Admin panel is available at:

/admin

Default credentials:

Username: admin  
Password: sgss2025

(These can be changed inside server.js)


## Project Structure

server.js → main backend server  
/data/content.json → editable website content  
/admin → admin dashboard  
/uploads → uploaded images  
/public or src → frontend assets


## Deployment Notes

The server must run on a Node.js environment.

The port should use:

const PORT = process.env.PORT || 3000;

Recommended deployment methods:
- VPS server with PM2
- Docker
- Node hosting provider
