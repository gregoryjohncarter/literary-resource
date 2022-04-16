# literary-resource 

## Usage
Navigate to the deployed link on Heroku or clone the repository to utilize the app. The features provided allow users to submit queries to the Google Books API and also save entries to their profile page. To save books the user must first complete a signup and subsequently log in upon returning to the site. 

## Installation
If you wish to use the app locally via this repository, you must install the dependencies by running 'npm i' in the root directory. This will automatically check for the required packages in both the server and the client directories. See technologies used in this README for more details about what packages are being utilized. Use 'npm run develop' from root to launch the server and the client together. 

## Technologies Used 
Express, Apollo Server Express, bcrypt, GraphQL, JsonWebToken, Mongoose, concurrently, Apollo Client, Bootstrap, jwt-decode, nodemon, React, React Router

## Methodology 
The server runs on Express and is interfaced with Apollo Server Express / Apollo Client using GraphQL and MongoDB in combination. The MongoDB schemas are created using Mongoose Object Data Modeling. From there, using auth-related NPMs such as bcrypt and JsonWebToken, the login and signup functionalities support the system of saving entries to the relevant user page. 

## Deployed Link