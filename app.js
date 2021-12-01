const express =require("express");
const ejs = require('ejs')
const mysql =require('mysql'); //데이터베이스 접속
const app =express()
const port=9000;

const path = require('path');
const session= require('express-session');
const crypto= require('crypto');
const FileStore = require('session-file-store')(session);
const cookieParser =require('cookie-parser');

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true}));
app.use(express.static("assets"));
app.use(express.json());

const con  = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'1234',
    database:'node_db',
});
/*데이터베이스 생성
con.query('create database node_db', function (err, resut){
    if (err) throw err;
    console.log('database created');
});*/

//세션등록
app.use(session({
    secret :'mykey', //이 값을 통해 세션을 암호화(노출xx)
    resave : false, //세션 데이터가 바뀌기 전까지는 세셩 저장소에 값을 저장하지 않음
    saveUninitialized:true, //세션이 필요하면 세션을 실행시킨다
    store : new FileStore() //세션이 데이터를 저장하는 곳
}));

//회원가입
app.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register');
});

app.post('/register',(req,res)=>{
    console.log('회원가입 하는 중')
    const body= req.body;
    const id = body.id;
    const pw=body.pw;
    const name =body.name;
    const age = body.age;

    con.query('select * from node_db.users where id=?',[id],(err,data)=>{
        if(data.length == 0 ){
            console.log('회원가입 성공');
            con.query('insert into node_db.users(id, pw, name, age) values(?,?,?,?)',[
                id,pw,name,age,
            ]);
            res.send('<script>alert("회원가입 성공!!!"); location.href="/"</script>')
        }
        else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패!! (동일한 정보가 존재합니다.)"); location.href="/register"</script>')
        }
    });
});

//로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('login');
});

app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    con.query('select * from node_db.users where id=?',[id],(err,data)=>{
        //로그인 확인
        console.log(data[0]);
        console.log(id);
        console.log(data[0].id);
        console.log(data[0].pw);
        console.log(id == data[0].id);
        console.log(pw == data[0].pw);
        if(id == data[0].id && pw == data[0].pw){
            console.log('로그인 성공!');
            //세션에 추가
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.pw;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('index',{ //정보전달
                    name : data[0].name,
                    id : data[0].id,
                    age : data[0].age,
                    is_logined : true
                });
            });
        }else{
            console.log('로그인 실패');
            res.render('login');
        }
    })
})

//로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        //세션 파괴후 할 것들
        res.redirect('/');
    });
});

//사용자정보 삭제문
app.get('/delete/:id',(req,res) => {
    const sql = 'DELETE FROM node_db.users WHERE id = ?';
    con.query(sql,[req.params.id], function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/');
    });
});

//users 레코드값 수정페이지 화면
app.get('/edit/:id', (req, res) => {
    const sql = 'SELECT * FROM node_db.users WHERE id = ?';
    con.query(sql,[req.params.id], function (err, result, fields){
        if(err) throw err;
        res.render('edit',{users : result});
    });
})

//users 레코드값 수정(업데이트) 구문
app.post('/update/:id',(req,res) => {
    const sql = 'UPDATE node_db.users SET ? WHERE id =' + req.params.id;
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/');
    });
});

app.listen(port,() =>{
    console.log(`${port}번 포트에서 서버대기중입니다.`)
})