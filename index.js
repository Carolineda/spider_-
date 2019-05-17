const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
// 服务端的 $ jquery
const url = 'https://movie.douban.com/top250';
const imageDir = './images/';

// 爬取每一页方法
function spiderMovies(start){
  https.get(url + `?start=${start}`, (res) => {
  res.setEncoding('utf-8');
  // 源源不断收到数据
  let html = '';
  res.on('data', (chunk) => {
    html += chunk;
  });
  // 数据发完了
  res.on('end', () => {
    // 可以用的 html
    const $ = cheerio.load(html);
    // 保存当前每一页电影

    let movies = [];
    $('.item').each(function() {
      // this 在那个作用域查找  每一部电影
      // 默认全局 每次都找到一张 
      const picUrl = $('.pic a img', this).attr('src');
      
      const title=$('.title',this).text();
      // 演员
      const star = $('.info .star .rating_num',this).text();

      // 入库-----
      const link = $('a',this).attr('href');

      // 拼装保存本地
      const movie = {
        title,
        star,
        link,
        picUrl
      }
      movies.push(movie);
      // console.log(picUrl);
      downloadImg(picUrl);
    })
    // 文件名上标识数据的页数
    saveLocalData(start / 25, movies);
  })
})
}


// 电影保存位置
const dataDir = './moviesData/'
function saveLocalData(page, movies){
  // 文本信息
  // json 保存  转换字符串
  fs.writeFile(dataDir + 'data${page}.json',JSON.stringify(movies),
  (err) => {
    if(!err)
    {
      console.log('数据保存成功');
      
    }
    else{
      console.log(err);
    }
  }
  )
}
function downloadImg(picUrl) {
  https.get(picUrl, (res) => {
    res.setEncoding('binary');
    let imageData = '';
    res.on('data', (chunk) => {
      imageData += chunk;
    })
    res.on('end', () => {
      // https://img3.doubanio.com/
      // view/photo/s_ratio_poster
      // /public/p480747492.jpg
      fs.writeFile(imageDir + path.basename(picUrl),
      imageData,
      'binary',
      (err) => {
        if (!err) {
          console.log('image downloaded:',
          path.basename(picUrl))
        }
      }
      )
    })
  })
}

// es6
function* doSpider(x){
  let start = 0;
 while(start < x)
 {
   yield start
   spiderMovies(start);
   start += 25;
 }
}

for ( let x of doSpider(250))
{
  console.log('爬取', x);

}