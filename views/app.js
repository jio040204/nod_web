const express =require("express");
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
    database:'net_after',
});
/*//데이터베이스 생성
con.query('create database net_after', function (err, resut){
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

//학생회원가입
app.get('/s_register',(req,res)=>{
    console.log('학생회원가입 페이지');
    res.render('s_register');
});

app.post('/s_register',(req,res)=>{
    console.log('회원가입 하는 중')
    const body= req.body;
    const s_grade = body.s_grade;
    const s_name = body.s_name;
    const s_pnum=body.s_pnum;
    const s_pw =body.s_pw;

    con.query('select * from student where s_grade=?',[s_grade],(err,data)=>{
        if(data.length == 0 ){
            console.log('회원가입 성공');
            con.query('insert into student(s_grade, s_name, s_pnum, s_pw) values(?,?,?,?)',[
                s_grade, s_name, s_pnum, s_pw,
            ]);
            res.send('<script>alert("회원가입 성공!!!"); location.href="/"</script>')
        }
        else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패!! (동일한 정보가 존재합니다.)"); location.href="/s_register"</script>')
        }
    });
});

//선생님회원가입
app.get('/t_register',(req,res)=>{
    console.log('학생회원가입 페이지');
    res.render('t_register');
});

app.post('/t_register',(req,res)=>{
    console.log('회원가입 하는 중')
    const body= req.body;
    const t_code = body.t_code;
    const t_name = body.t_name;
    const t_pnum=body.t_pnum;
    const t_pw =body.t_pw;

    con.query('select * from teacher where t_code=?',[t_code],(err,data)=>{
        if(data.length == 0 ){
            console.log('회원가입 성공');
            con.query('insert into teacher(t_code, t_name, t_pnum, t_pw) values(?,?,?,?)',[
                t_code, t_name, t_pnum, t_pw,
            ]);
            res.send('<script>alert("회원가입 성공!!!"); location.href="/"</script>')
        }
        else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패!! (동일한 정보가 존재합니다.)"); location.href="/t_register"</script>')
        }
    });
});

//학생로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('login');
});

app.post('/s_login',(req,res)=>{
    const body = req.body;
    const s_grade = body.s_grade;
    const s_pw = body.s_pw;

    con.query('select * from student where s_grade=?',[s_grade],(err,data)=>{
        //로그인 확인
        console.log(data[0]);
        console.log(s_grade);
        console.log(data[0].s_grade);
        console.log(data[0].s_pw);
        console.log(s_grade == data[0].s_grade);
        console.log(s_pw == data[0].s_pw);
        if(s_grade == data[0].s_grade && s_pw == data[0].s_pw){
            console.log('로그인 성공!');
            //세션에 추가
            req.session.is_logined = true;
            req.session.s_grade = data.s_grade;
            req.session.s_name = data.s_name;
            req.session.s_pnum = data.s_pnum;
            req.session.s_pw = data.s_pw;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('index',{ //정보전달
                    s_grade : data[0].s_grade,
                    s_name : data[0].s_name,
                    s_pnum : data[0].s_pnum,
                    s_pw : data[0].s_pw,
                    is_logined : true
                });
            });
        }else{
            console.log('로그인 실패');
            res.render('s_login');
        }
    })
})

//선생님로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('login');
});

app.post('/t_login',(req,res)=>{
    const body = req.body;
    const t_code = body.t_code;
    const t_pw = body.t_pw;

    con.query('select * from teacher where t_code=?',[t_code],(err,data)=>{
        //로그인 확인
        console.log(data[0]);
        console.log(t_code);
        console.log(data[0].t_code);
        console.log(data[0].t_pw);
        console.log(t_code == data[0].t_code);
        console.log(t_pw == data[0].t_pw);
        if(t_code == data[0].t_code && t_pw == data[0].t_pw){
            console.log('로그인 성공!');
            //세션에 추가
            req.session.is_logined = true;
            req.session.t_code = data.t_code;
            req.session.t_name = data.t_name;
            req.session.t_pnum = data.t_pnum;
            req.session.t_pw = data.t_pw;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('index',{ //정보전달
                    t_code : data[0].t_code,
                    t_name : data[0].t_name,
                    t_pnum : data[0].t_pnum,
                    t_pw : data[0].t_pw,
                    is_logined : true
                });
            });
        }else{
            console.log('로그인 실패');
            res.render('t_login');
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

app.listen(port,() =>{
    console.log(`${port}번 포트에서 서버대기중입니다.`)
})