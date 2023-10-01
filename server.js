const express = require('express');
const app = express();
const url = "https://intent-kit-16.hasura.app/api/rest/blogs";
const fetch = require('node-fetch');
const _ = require('lodash');

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/blog-stats', dataFetcher, (req, res) => {
    // console.log(req.fetchedData);

    //finding number of blogs in the response
    const numberOfBlogs = _.size(req.fetchedData);

    
    //finding the longest blog title
    const blogTitleLengths = _.map(req.fetchedData, (blog) => { return _.size(blog.title) });
    const longestBlogTitle = (_.find(req.fetchedData, (blog) => {
        if (_.size(blog.title) == _.max(blogTitleLengths)) {
            return blog.title
        }
    })).title;


    //finding the no of titles with word "privacy"
    const privacy = new RegExp("privacy", "i");
    const privacyTitles = _.filter(req.fetchedData, (blog) => {
        if (privacy.test(blog.title)) {
            return blog.title
        }
    });


    //array of unique array titles
    const titleArray = _.map(req.fetchedData, (blog) => { return (blog.title) });
    const uniqueTitles = _.uniq(titleArray, (title) => { return title.toLowerCase(); });

    const analytics = {
        "numberOfBlogs": numberOfBlogs,
        "longestBlogTitle": longestBlogTitle,
        "privacyTitles": privacyTitles,
        "uniqueTitles": uniqueTitles
    }
    res.send(analytics);

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
            req.fetchedData = response.blogs;
            next()
        })
        .catch(err => console.error(err));
}


app.listen(3000, () => console.log('Server running on port 3000'));
