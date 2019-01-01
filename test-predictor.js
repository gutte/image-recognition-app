var fs = require('fs');
var axios = require('axios');
var sharp = require('sharp');
//~ var jpeg = require('jpeg-js');

var predict = require('tf-training').predict;   //must be linked


//filesystem

//~ jpgData = fs.readFileSync(__dirname + '/test-jpeg/batch_6_img_0.jpg');
//~ predict(jpgData).then(function(pre){
  //~ console.log(pre);
//~ });


//url

predictImg('https://upload.wikimedia.org/wikipedia/commons/3/32/House_sparrow04.jpg')
.then(function(pre){
  console.log(pre);
});

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
