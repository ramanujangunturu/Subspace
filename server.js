const express = require('express');
const app = express();
const url = "https://intent-kit-16.hasura.app/api/rest/blogs";
const fetch = require('node-fetch');

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/blog-stats',dataFetcher, (req, res) => {
    console.log(req.fetchedData);
    res.send("working!!")
});

function dataFetcher(req, res, next) {
    const options = {
        method: 'GET',
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      };
      
      fetch('https://intent-kit-16.hasura.app/api/rest/blogs', options)
        .then(response => response.json())
        .then(response => {
            req.fetchedData = response;
            next()      
        })
        .catch(err => console.error(err));
}


app.listen(3000, () => console.log('Server running on port 3000'));
