# Broadway Beats
A dynamic web application for musical theatre lovers who want to receive personalized recommendations based on the type of musicals they listen to. **Work In Progress**

## Features
1. User can submit their preferred genres and musical styles in the form of a questionnaire
2. User can view their recommendations
3. User can search for a musical
4. User can filter through musicals
5. User can view details of a musical
6. User can view related musicals
7. User can like a musical
8. User can add a musical to a collection
9. User can view all of their collections
10. User can delete a collection
11. User can delete a musical from a collection
12. User can view details about a collection
13. User can suggest a musical

## Technologies Used
* React.js
* Node.js
* Express
* PostgreSQL
* HTML5
* CSS3
* AWS EC2

## Getting Started
1. Clone the repo and navigate to the directory
``` git clone https://github.com/sierra-henderson/broadwaybeats.git
    cd broadwaybeats
```
2. Install all dependencies
``` npm install ```

3. Start your PostgreSQL server
``` sudo service postgresql start ```

4. Import existing database
``` npm run db:import ```

5. Compile project
``` npm run dev ```

7. Access application by entering [https://localhost:3000](https://localhost:3000) in the browser

## Lessons Learned
* Building a full-stack application in a solo environment
* Creating complex SQL queries in order to perform filtering and recommendation
* Reusing React components to take in different callback functions

## Preview
![Broadway Beats Preview](https://github.com/sierra-henderson/broadwaybeats/blob/master/preview.gif)
