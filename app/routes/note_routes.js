const bcrypt = require('bcryptjs');
const passport = require('passport');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
//home
app.get('/',(req,res)=> res.render('welcome'))

//user model
const User = require('../models/User')


//register
app.get('/users/login',(req,res)=> res.render('login'))

//login 
app.get('/users/register',(req,res)=> res.render('register'))




   // Register
app.post('/users/register', (req, res) => {
  
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                console.log(newUser);
                
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});



// Login
app.post('/users/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


//HOME


  app.get('/admin', function(req,res){
    const data = db.collection('subjects').find().toArray((err, subjects) => {
      if (err){     
        res.send({'error':'An error has occurred'});
      } else {
        // res.send(units);
        const tutorData = db.collection('tutors').find().toArray((err, tutors)=>{
          if (err){
            res.send({'error':'An error has occurred'});
          }else {
              res.render('index.ejs', { "subjects": subjects, "tutors":tutors })
          }
        })

      }
  });});
  //=====//====//==
 app.get('/units/:id', (req, res) => {
   const id = req.params.id;
   const details = { '_id': new ObjectID(id) };
   db.collection('units').findOne(details, (err, item) => {
     if (err) {
       res.send({'error':'An error has occurred'});
     } else {
       res.send(item);
     }
   });
 });

app.get('/gg', (req, res)=> {
  const data = db.collection('units').find({}).toArray((err, units) => {
    if (err){
      res.send({'error':'An error has occurred'});
    } else {
      // res.send(units);
      res.render('hi.ejs', { "units": units })
    }
  });
})

 app.delete('/units/:id', (req, res) => {
    const id = req.params.id;
    const unitDetails = { '_id': new ObjectID(id) };
    db.collection('units').remove(unitDetails, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send('Unit ' + id + ' deleted!');
      }
    });
  });

  app.put('/units/:id', (req, res) => {
     const id = req.params.id;
     const details = { '_id': new ObjectID(id) };
     const note = { text: req.body.text, title: req.body.title };
     db.collection('units').update(details, note, (err, result) => {
       if (err) {
           res.send({'error':'An error has occurred'});
       } else {
           res.send(note);
       }
     });
   });

app.post('/units', (req, res) => {
   const note = { description: req.body.text, title: req.body.title, subjectid: req.body.subID, unitno: req.body.uniID, tutorid: req.body.teachID, urlid: req.body.urlID };
   console.log(note);
   db.collection('units').insert(note, (err, result) => {
     if (err) {
       res.send({ 'error': 'An error has occurred' });
     } else {
       res.send(result.ops[0]);
     }
   });
 });

var subid
 // subject page

 app.get('/subject', (req, res)=>{
   const data = db.collection('subjects').find({}).toArray((err, subjects) => {
     if (err){
       res.send({'error':'An error has occurred'});
     } else {
       // res.send(units);
       res.render('subject.ejs', { "subjects": subjects })
     }
   });
 });
 app.post('/subject',(req, res)=>{
   subid = req.body.subject;
   console.log(subid);
   console.log('hello22');
 });

 app.get('/tutor', (req, res)=>{
   const data = db.collection('tutors').find({subjectid:subid}).toArray((err, tutors) => {
     if (err){
       res.send({'error':'An error has occurred'});
     } else {
       // res.send(units);
       res.render('tutors.ejs', { "tutors": tutors })
     }
   });
 });

var tuid;

app.post('/tutor',(req, res)=>{
  tubid = req.body.tutor;
  console.log(tubid);
  console.log('hello2');
});


 app.get('/syllabus', (req, res)=>{
   var query = {'subjectid':subid,'tutorid':tubid}
   const data = db.collection('units').find({subjectid:subid}).toArray((err, units) => {
     if (err){
       res.send({'error':'An error has occurred'});
     } else {
       // res.send(units);
       res.render('syllabus.ejs', { "units": units })
     }
   });
 });


 app.get('/unit', (req, res)=>{
   const data = db.collection('units').find({subjectid:"sub01"}).toArray((err, units) => {
     if (err){
       res.send({'error':'An error has occurred'});
     } else {
       // res.send(units);
       res.render('units.ejs', { "units": units })
     }
   });
 });
 // app.post('/subject', (req, res)=>{
 //   console.log(req.body.School);
 // });




app.post('/comment', (req, res)=>{
  var comment_id = ObjectID();
  db.collection('units').update({_id:ObjectID(req.body.unit_id)},{$push:{"comments":{_id:comment_id,name:req.body.name, comment:req.body.comment}}},(error,post)=>{
    res.redirect('/syllabus')
  });
  console.log(req.body);
})

app.post('/comment_delete', (req, res)=>{
  db.collection('units').update({_id:ObjectID(req.body.unit_id)},{$pull:{"comments":{_id:ObjectID(req.body.comment_id)}}},(error,post)=>{
    res.redirect('/syllabus')
  });
  console.log(req.body);
})

app.post('/reply',(req, res)=>{
  var reply_id = ObjectID();
  console.log(req.body);
  db.collection('units').update({"_id":ObjectID(req.body.unit_id), "comments._id":ObjectID(req.body.comment_id)},{$push:{"comments.$.replies":{_id:reply_id, name:req.body.name, reply:req.body.reply}}},(error, post)=>{
    res.redirect('/syllabus')
  })
})


};
