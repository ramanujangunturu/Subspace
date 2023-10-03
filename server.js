const express = require('express');
const app = express();
const url = "https://intent-kit-16.hasura.app/api/rest/blogs";
const fetch = require('node-fetch');
const _ = require('lodash');

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/blog-stats', dataFetcher, dataAnalyzer);

//blog-searcher api which takes query parameter
app.get('/api/blog-search', dataFetcher, (req, res) => {
    const blogs = req.fetchedData;
    const queryParameters = req.query;

    function dataSearcher(queryParameters) {
        const regex = new RegExp(queryParameters.query, "i");
        const searchResult = _.filter(req.fetchedData, (blog) => {
            if (regex.test(blog.title) || regex.test(blog.id) || regex.test(blog.image_url)) {
                return blog;
            }
        });
        return searchResult;
    }

    //memoizing the dataSearcher function
    const memoizedDataSearcher = _.memoize(dataSearcher);
    const searchResult = memoizedDataSearcher(queryParameters);
    if(_.isEmpty(searchResult)){
        res.send("No results found");
    }
    // console.log(memoizedDataSearcher.cache.get(queryParameters));
    res.send(searchResult);
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
            const blogs = response.blogs;
            req.fetchedData = blogs;
            next();
        })
        .catch(err => { 
            console.error(err) 
            res.send("something went wrong").status(500);
        });
}

function dataAnalyzer(req, res, next) {
    const blogs = req.fetchedData;
    function analyzer(blogs) {
        //finding number of blogs in the response
        const numberOfBlogs = _.size(blogs);

        //finding the longest blog title
        const blogTitleLengths = _.map(blogs, (blog) => { return _.size(blog.title) });
        const longestBlogTitle = (_.find(blogs, (blog) => {
            if (_.size(blog.title) == _.max(blogTitleLengths)) {
                return blog
            }
        })).title;

        //finding the no of titles with word "privacy"
        const privacy = new RegExp("privacy", "i");
        const privacyTitles = _.filter(blogs, (blog) => {
            if (privacy.test(blog.title)) {
                return blog
            }
        }).title;


        //array of unique array titles
        const titleArray = _.map(blogs, (blog) => { return (blog.title) });
        const uniqueTitles = _.uniq(titleArray, (title) => { return title.toLowerCase(); });

        const analytics = {
            "numberOfBlogs": numberOfBlogs,
            "longestBlogTitle": longestBlogTitle,
            "privacyTitles": privacyTitles,
            "uniqueTitles": uniqueTitles
        }
        return analytics;
    }

    //memoizing the analyzer function
    const memoizedAnalyzer = _.memoize(analyzer);

    //checking if the data is coming from cache or not
    
    // memoizedAnalyzer.cache.set(blogs, "cache sending");
    const analytics = memoizedAnalyzer(blogs);
    // console.log(memoizedAnalyzer.cache.get(blogs));
    res.send(analytics);

}


app.listen(3000, () => console.log('Server running on port 3000'));
