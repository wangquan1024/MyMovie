 var express =require('express')
 var path = require('path')
 var mongoose = require('mongoose')
 var _ = require('underscore')
 var Movie = require('./models/movie')
 var bodyParser = require('body-parser');
 var port = process.env.PORT || 3000
 var app = express()

 mongoose.Promise = global.Promise;
 // 连接数据库
 mongoose.connect('mongodb://localhost/imooc',{useMongoClient:true})

 app.set('views', './views/pages')
 app.set('view engine','pug')
 app.use(bodyParser.urlencoded({
		extended: true
 }));
 //上面那个要加extended:true，否则会在post的时候出错
//将表单里的数据进行格式化
 app.use(express.static(path.join(__dirname,'public')))
 app.locals.moment = require('moment')
 app.listen(port)

 console.log('imooc started on port' + port)

 // 电影首页路由
 app.get('/', function(req, res){
     // 查询数据库，返回所有值
    Movie.fetch(function (err,movies) {
        if(err){
            console.log(err);
        }else{
            res.render('index',{
                title: 'MyMovie 首页',
                movies: movies
            })
        }
    })
 })

 // 电影详情页路由
  app.get('/movie/:id',function(req, res){
      // 接收id
      var id = req.params.id;
        // 通过id，查找相应的数据，并在页面显示
      Movie.findById(id,function (err,movie) {
          res.render('detail',{
              title: 'MyMovie '+ movie.title,
              movie: movie
          })
      })
 })

 // 电影录入页
   app.get('/admin/movie',function(req, res){
 	res.render('admin',{
 		title: 'MyMovie 录入页',
 		movie: {
	    	title: '',
	    	doctor: '',
	    	country: '',
	    	year: '',
	     	poster: '',
	     	flash: '',
	     	summary: '',
	     	language: ''
	    } 
 	})
 })

 // 电影更新
 app.get('/admin/update/:id',function (req,res) {
     var id = req.params.id

     if(id) {
         Movie.findById(id,function (err,movie) {
             res.render('admin',{
                 title: "MyMovie 后台更新页",
                 movie: movie
             })
         })
     }
 })


 app.post('/admin/movie/new',function (req,res) {
     var id = req.body.movie._id
     var movieObj = req.body.movie
     var _movie

     // 表单提交的数据不为空字符串或者未定义时
     // id为空时，就是新增数据，id不为空时，就是更改数据
     if(id !== 'undefined' && id !== ''){
         Movie.findById(id,function (err,movie) {
             if(err){
                 console.log(err);
             }

             // underscore库中的函数，对movieobj进行了深拷贝
             _movie = _.extend(movie,movieObj)
             _movie.save(function (err, movie) {
                 if(err){
                     console.log(err);
                 }
                 res.redirect("/movie/"+movie._id)
             })
         })
     }else {
         _movie = new Movie({
             doctor: movieObj.doctor,
             title: movieObj.title,
             country: movieObj.country,
             language: movieObj.language,
             year: movieObj.year,
             poster: movieObj.poster,
             summary: movieObj.summary,
             flash: movieObj.flash
         })

         _movie.save(function (err,movie) {
             if(err){
                 console.log(err);
             }

             res.redirect('/movie/'+movie._id)
         })
     }
 })

    // 后台列表展示页
    app.get('/admin/list',function(req, res){
        Movie.fetch(function (err,movies) {
            if(err){
                console.log(err);
            }else{
                res.render('list',{
                    title: 'MyMovie 列表页',
                    movies: movies
                })
            }
        })
     })

 // 删除电影数据
 app.delete('/admin/list', function (req,res) {
     var id = req.query.id
     
     if(id){
         Movie.remove({_id: id},function (err, movie) {
             if(err){
                 console.log(err);
             }else {
                 res.json({success: 1})
             }
         })
     }
 })