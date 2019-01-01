var fs = require('fs');

const express = require('express');
var axios = require('axios');
var sharp = require('sharp');

var predict = require('tf-training').predict;   //must be linked

const app = express();
const port = 3000;

app.use(express.static('public'));

app.set('view engine', 'ejs')

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get('/', function (req, res) {
  res.render('index', {message: null, imgURL: null});
});


app.post('/', function (req, res) {
  //var img = fs.readFileSync('./test-jpeg/batch_6_img_0.jpg');
  predictImg(req.body.imgURL)
  .then(function (pred) {
    var message = "";
    if (pred[0][0] > 0.8) {
      message = 'This is a ' +pred[0][1]+'! ('+ Math.round(pred[0][0]*100)+' % confidence)';
    } else {
      message = 'This could be a ' +pred[0][1]+' ('+ Math.round(pred[0][0]*100)+'%) or a '+ pred[1][1]+ ' ('+ Math.round(pred[1][0]*100)+'% confidence).';
    }
    res.render('index', {
      message: message,
      imgURL: req.body.imgURL
    });
  })
  .catch(function (err) {
    res.render('index', {message: err, imgURL: null});
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


function predictImg(url) {
  return new Promise(function(resolve,reject) { 
    axios.get(url, {
      responseType: 'arraybuffer'
    })
    .then(function(res) {
      imgdata = new Buffer(res.data, 'binary');
      sharp(imgdata)
        .resize(32, 32, {
          fit: sharp.fit.cover,
        })
        .toFormat('jpeg')
        .toBuffer()
        .then(function(jpgData) {
          //~ sharp(jpgData).toFile('temp/temp.jpg');
          predict(jpgData).then(function (prediction) {
            resolve(prediction);
          });
        });
    })
    .catch(function(err) {
      reject(err);
    });
  });
}
