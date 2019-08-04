var express = require('express');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
var mysql = require('mysql');


var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



app.set('view engine',"ejs");
app.use(bodyparser.urlencoded({extended:false}));

//connection to mysql database
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "kumar@1234",
    database: "iiy"
});

con.connect(function(err){
    if(err) throw err;
    else {
      console.log("successfully connected");
    }
});


//Serves resources from public folder
app.use(express.static('public'))
app.use(express.static('videos'))
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/videos', express.static(__dirname + '/public/videos'));


//for home page
app.get('/',function(req,res){
    res.render('home');
    })
  //for register page
  app.get('/register',function(req,res){
  res.render('register',{msg: ''});
  })
  //for login page
  app.get('/login',function(req,res){
    res.render('login',{temp: ''});
    })
  //for profile page 
  app.get('/profile',function(req,res){
    res.render('profile',{tem: ''});
    })
  //for home page
  app.get('/home',function(req,res){
    res.render('home');
  })
  //for admin page
  app.get('/admin',function(req,res){
    res.render('admin');
  })
  
  // route for test page to start
app.get('/test', function(req, res) {
    res.render('test',{temp: ''});
});



//for register
app.post("/register",function (req,res)
{
    var select_class = req.body.select_class;
    var name = req.body.name;
    var mobile = req.body.mobile;
    var password = req.body.password;
   
    let q = `insert into users(select_class,name,mobile,password) values("${select_class}","${name}","${mobile}","${password}")`;
    con.query(q,function(err,result){
        if(err){
          res.render('register',{ msg : "ERROR:Invalid input"})

        }
        else {
          res.redirect('login');
        }
    })
})


//for student and admin page login
app.post('/login', function(req, res) {
    var mobile = req.body.mobile;
    var password = req.body.password;
    if(mobile == "1234567890" && password=="iiysoftware"){
      res.redirect('admin');
    }

    else if (mobile && password) {
      
        con.query('SELECT * FROM users WHERE mobile = ?  AND password = ?', [mobile, password], function(err, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.mobile = mobile;
                req.session.password = password;
                res.render('profile'/*,{tem: name}*/);
            } else {
            res.render('login',{ temp:"invalid details"});
            
      }
           res.end();
        });
    } else
  {
       res.render('login',{ temp:"Please enter details"});
        res.end();
    }
});



//route for view all test questions
app.get('/admin/view_test',function(req,res){
    let sql = 'select * from test';
    let query = con.query(sql,function(err,result){
        if(err) throw err;
        let test_data =[];

        for (var i = 0; i < result.length; i++) {
            let obj={
                id: result[i].id,
                question : result[i].question,
                subject : result[i].subject,
                select_class : result[i].select_class,
                answer : result[i].answer,
            };
            test_data.push(obj);
        } 
        res.render('view_test',{test_data:test_data})
        // data.forEach(element => {
        //     console.log(element)
        // });
    })
})


//route to give the test
app.post('/teststart',function(req,res){
    var select_class = req.body.select_class;
    var subject = req.body.subject;
    con.query('SELECT * FROM test WHERE select_class = ?  AND subject = ?', [select_class, subject], function(err, result, fields) {
        if(err) throw err;
        if (result.length > 0) {
            req.session.loggedin = true;
            req.session.select_class = select_class;
            req.session.subject = subject;
        let test_data =[];

        for (var i = 0; i < result.length; i++) {
            let obj={
                id: result[i].id,
                question : result[i].question,
            };
            test_data.push(obj);
        } 
        res.render('testanswer',{test_data:test_data})
        }
        else{
            res.render('test',{ temp:"Data is not Available"});
        }
        // data.forEach(element => {
        //     console.log(element)
        // });
    });
})



//route for submit answers
app.post("/testanswersubmit",function (req,res)
{
    var answer = req.body.answer;
    
   
    let q = `insert into answer(answer) values("${answer}")`;
    con.query(q,function(err,result){
        if(err) throw err;
        else{
          /*res.render('view_test',{test_data: ''});*/
          res.redirect('/home');
        }
    })
})





//route for storing data
app.post("/admin/view_test/add",function (req,res)
{
    var question = req.body.question;
    var subject = req.body.subject;
    var select_class = req.body.select_class;
    var answer = req.body.answer;
   
    let q = `insert into test(question,subject,select_class,answer) values("${question}","${subject}","${select_class}","${answer}")`;
    con.query(q,function(err,result){
        if(err) throw err;
        else{
          /*res.render('view_test',{test_data: ''});*/
          res.redirect('/admin/view_test');
        }
    })
})


//route for deleting quiz question
app.post("/admin/view_test/delete",function (req,res) 
{
    var id = req.body.id;
    let sql = `DELETE FROM test WHERE id=${id};`;
    con.query(sql,function(err,result){
        if(err) throw err;
        res.redirect("/admin/view_test");
    })
})






app.listen(4000, function () {
    console.log('listening on port', 4000);
});

                      

