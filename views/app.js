const express =require("express");
const mysql =require('mysql'); //데이터베이스 접속
const app =express();
const port=9000;

const path = require('path');
const session= require('express-session');
const crypto= require('crypto');
const FileStore = require('session-file-store')(session);
const cookieParser =require('cookie-parser');
const { fstat } = require("fs");

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
});
*/
//세션등록
app.use(session({
    secret :'mykey', //이 값을 통해 세션을 암호화(노출xx)
    resave : false, //세션 데이터가 바뀌기 전까지는 세셩 저장소에 값을 저장하지 않음
    saveUninitialized:true, //세션이 필요하면 세션을 실행시킨다
    store : new FileStore() //세션이 데이터를 저장하는 곳
}));

//student 테이블의 레코드값 가져오기
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM net_after.student';
    con.query(sql, function (err, result, fields){
        if(err) throw err;
        res.render('s_index', {student : result});
    });
});

//teacher 테이블의 레코드값 가져오기
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM net_after.teacher';
    con.query(sql, function (err, result, fields){
        if(err) throw err;
        res.render('t_index', {teacher : result});
    });
});

//afterclass 테이블의 레코드값 가져오기
app.get('/',(req,res)=>{
    const sql = 'SELECT * FROM net_after.afterclass';
    con.query(sql,function(err,result, fields){
        if(err)throw err;
        res.render('afterclass',{afterclass : result});
    });
});

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


    con.query('select * from net_after.student where s_grade=?',[s_grade],(err,data)=>{
        if(data.length == 0 ){
            console.log('회원가입 성공');
            con.query('insert into net_after.student(s_grade, s_name, s_pnum, s_pw) values(?,?,?,?)',[
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

// app.post('/afterclass',(req,res)=>{
//     console.log('페이지 접속');
//     const bodey=req.body;
//     const a_code= body.a_code;
//     const a_name= body.a_name;
//     const a_place= body.a_place;
//     const a_time= body.a_time;
//     const t_code= body.t_code;
//     const s_grade= body.s_grade;
// });

//선생님회원가입
app.get('/t_register',(req,res)=>{
    console.log('선생님회원가입 페이지');
    res.render('t_register');
});

app.post('/t_register',(req,res)=>{
    console.log('회원가입 하는 중')
    const body= req.body;
    const t_code = body.t_code;
    const t_name = body.t_name;
    const t_pnum=body.t_pnum;
    const t_pw =body.t_pw;

    con.query('select * from net_after.teacher where t_code=?',[t_code],(err,data)=>{
        if(data.length == 0 ){
            console.log('회원가입 성공');
            con.query('insert into net_after.teacher(t_code, t_name, t_pnum, t_pw) values(?,?,?,?)',[
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
app.get('/s_login',(req,res)=>{
    console.log('로그인 작동');
    res.render('s_login');
});

app.post('/s_login',(req,res)=>{
    const body = req.body;
    const s_grade = body.s_grade;
    const s_pw = body.s_pw;

    con.query('select * from net_after.student where s_grade=?',[s_grade],(err,data)=>{
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
            req.session.s_grade = data[0].s_grade;
            req.session.s_name = data[0].s_name;
            req.session.s_pnum = data[0].s_pnum;
            req.session.s_pw = data[0].s_pw;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('s_index',{ //정보전달
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
app.get('/t_login',(req,res)=>{
    console.log('로그인 작동');
    res.render('t_login');
});

app.post('/t_login',(req,res)=>{
    const body = req.body;
    const t_code = body.t_code;
    const t_pw = body.t_pw;

    con.query('select * from net_after.teacher where t_code=?',[t_code],(err,data)=>{
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
            req.session.t_code = data[0].t_code;
            req.session.t_name = data[0].t_name;
            req.session.t_pnum = data[0].t_pnum;
            req.session.t_pw = data[0].t_pw;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('t_index',{ //정보전달
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



//교실 테이블 보여주기

app.get('/afterclass', (req, res) => {
    const sql = 'SElECT * FROM net_after.afterclass';
    con.query(sql, function (err, result, fields){
        if(err) throw err;
        res.render('afterclass', {afterclass : result});
    });
});


app.post('/afterclass',(req,res)=>{
    const body = req.body;
    const a_code = body.a_code;
    const a_name = body.a_name;
    const a_place = body.a_place;
    const a_time = body.a_time;
    const t_code = body.t_code;
    const s_grade = body.s_grade;

    con.query('select * from net_after.afterclass where a_code =?',[a_code],(err,data)=>{
            //세션에 추가
            req.session.is_logined = true;
            req.session.a_code = data[0].a_code;
            req.session.a_name = data[0].a_name;
            req.session.a_place = data[0].a_place;
            req.session.a_time = data[0].a_time;
            req.session.t_code = data[0].t_code;
            req.session.s_grade = data[0].s_grade;
            req.session.save(function(){ //세션 스토어에 적용하는 작업
                res.render('afterclass',{ //정보전달
                     a_code : data[0].a_code,
                     a_name : data[0].a_name,
                     a_place : data[0].a_place,
                     a_time : data[0].a_time,
                     t_code : data[0].t_code,
                     s_grade : data[0].s_grade,
                     is_logined : true
                });
            });
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
app.get('/delete/:s_grade',(req,res) => {
    const sql = 'DELETE FROM net_after.student WHERE s_grade = ?';
    con.query(sql,[req.params.s_grade], function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/');
    });
});
//사용자정보 삭제문
app.get('/delete/:t_code',(req,res) => {
    const sql = 'DELETE FROM net_after.teacher WHERE t_code = ?';
    con.query(sql,[req.params.t_code], function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/');
    });
});

//방과후 페이지
app.get('/afterclass',(req,res)=>{
    const sql = 'SELECT * FROM net_after.afterclass';
    con.query(sql,[req.params], function (err, result, fields){
        if(err) throw err;
        res.render('afterclass',{afterclass : result});
    });
});

//student 레코드값 수정페이지 화면
 app.get('/s_edit/:s_grade', (req, res) => {
     const sql = 'SELECT * FROM net_after.student WHERE s_grade = ?';
     con.query(sql,[req.params.s_grade], function (err, result, fields){
         if(err) throw err;
         res.render('s_edit',{student : result});
     });
 })

//teacher 레코드값 수정페이지 화면
app.get('/t_edit/:t_code', (req, res) => {
    const sql = 'SELECT * FROM net_after.teacher WHERE t_code = ?';
    con.query(sql,[req.params.t_code], function (err, result, fields){
        if(err) throw err;
        res.render('t_edit',{teacher : result});
    });
})

//student 레코드값 수정(업데이트) 구문
app.post('/update/:s_grade',(req,res) => {
    const sql = 'UPDATE net_after.student SET ? WHERE s_grade =' + req.params.s_grade;
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/s_login');
    });
});

//teacher 레코드값 수정(업데이트) 구문
app.post('/update/:t_code',(req,res) => {
    const sql = 'UPDATE net_after.teacher SET ? WHERE t_code =' + req.params.t_code;
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/t_login');
    });
});

app.listen(port,() =>{
    console.log(`${port}번 포트에서 서버대기중입니다.`)
})