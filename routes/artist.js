var express = require('express');
var router = express.Router();
var perPage = 2;
var url = require('url');
var pool = require("../mysql_pool");

/* GET home page. */
router.get('/list', function (req, res, next) {
    res.send('for list test, you should put the \'/list\' more');
});

var customRenderer = function (res, titleStr, dataObjNm, dataObj) {
    return res.render('gridTest', {
        "title": titleStr,
        dataObjNm: dataObj
    });
}

router.get('/', function (req, res, next) {
    return res.render('artist', {
        "title": 'Artists'
    });
});

router.get('/search', function (req, res, next) {
    res.send('search get request called');
});

router.post('/next', function (req, res, next) {
    var url = '/gridTest?pageNo=' + (req.body.page_no * 1 + 1);
    res.location(url);
    res.redirect(url);
});

router.post('/search', function (req, res, next) {

    var searchText = req.body.searchText === undefined ? '' : req.body.searchText.trim();
    console.log('searchText:', searchText);

    var selectQuery = "SELECT a.id, a.name, ceil((sum(ca.cnt) * 100 - sum(ca.rank_sum)/sum(ca.cnt))/200)/10 as popularity";
    selectQuery += " FROM artists a, chart_analysis ca ";
    selectQuery += " WHERE a.cap_name LIKE concat('%', upper('" + searchText + "'), '%')";
    selectQuery += " and a.id = ca.artist_id";
    selectQuery += " group by a.id, a.name order by 3 desc";
    console.log('selectQuery:', selectQuery);

    pool.query(selectQuery, function (err, rows, fields) {
        if (err) throw err;

        // console.log('The solution is: ', rows[0].solution);
        res.jsonp({
            "rows": rows
        });
    });
    // pool.end();
});

router.post('/chart', function (req, res, next) {

    var song_id = req.body.song_id === undefined ? '' : req.body.song_id;
    console.log('song_id:', song_id);

    var selectQuery = "SELECT c.date, c.rank";
    selectQuery += " FROM chart c";
    selectQuery += " WHERE c.song_id = " + song_id;
    console.log('selectQuery:', selectQuery);

    pool.query(selectQuery, function (err, rows, fields) {
        if (err) throw err;

        // console.log('The solution is: ', rows[0].solution);
        res.jsonp({
            "rows": rows
        });
    });
});



router.post('/popularity', function (req, res, next) {

    var searchArtistId = req.body.searchArtistId === undefined ? '' : req.body.searchArtistId;
    console.log('searchArtistId:', searchArtistId);

    var selectQuery = " select ca.year, ceil((sum(ca.cnt) * 100 - sum(ca.rank_sum)/sum(ca.cnt))/200)/10 as popularity";
    selectQuery += " from artists a, chart_analysis ca ";
    selectQuery += " where a.id = ca.artist_id";
    selectQuery += " and a.id = " + searchArtistId;
    selectQuery += " group by a.id, a.name, ca.year";
    console.log('selectQuery:', selectQuery);

    pool.query(selectQuery, function (err, rows, fields) {
        if (err) throw err;

        // console.log('The solution is: ', rows[0].solution);
        res.jsonp({
            "rows": rows
        });
    });
});

router.post('/collaborator', function (req, res, next) {

    var searchArtistId = req.body.searchArtistId === undefined ? '' : req.body.searchArtistId;
    console.log('searchArtistId:', searchArtistId);

    var selectQuery = " select sm.artist_id, a.name ";
    selectQuery += " from song_mapp sm, artists a, ";
    selectQuery += " (select sm.song_id from song_mapp sm where sm.artist_id = " + searchArtistId + " group by sm.song_id) x";
    selectQuery += " where sm.artist_id = a.id";
    selectQuery += " and x.song_id = sm.song_id"; 
    selectQuery += " and a.id != " + searchArtistId; 
    selectQuery += " group by sm.artist_id, a.name"; 
    console.log('selectQuery:', selectQuery);

    pool.query(selectQuery, function (err, rows, fields) {
        if (err) throw err;

        // console.log('The solution is: ', rows[0].solution);
        res.jsonp({
            "rows": rows
        });
    });
});

router.post('/song', function (req, res, next) {

    var searchArtistId = req.body.searchArtistId === undefined ? '' : req.body.searchArtistId;
    console.log('searchArtistId:', searchArtistId);

    var selectQuery = "SELECT s.id, s.name, s.artists_meta, count(c.rank) as cnt,";
    selectQuery += " round(sum(c.rank)/count(c.rank)) as chart_point,"
    selectQuery += " substr(max(c.date), 1, 4) as chart_year"
    selectQuery += " FROM songs s, song_mapp sm, artists a, chart c";
    selectQuery += " WHERE s.id = sm.song_id and a.id = sm.artist_id";
    selectQuery += " and c.song_id = sm.song_id";
    selectQuery += " and a.id = " + searchArtistId;
    selectQuery += " group by s.id, s.name, s.artists_meta";
    console.log('selectQuery:', selectQuery);

    pool.query(selectQuery, function (err, rows, fields) {
        if (err) throw err;

        // console.log('The solution is: ', rows[0].solution);
        res.jsonp({
            "rows": rows
        });
    });
});

module.exports = router;
