const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const res = require('express/lib/response');

let thread_id, reply_id;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Test POST /create a new thread', function(done) {
    chai.request(server)
    .keepOpen()
    .post('/api/threads/board44')
    .send({
      text: 'thread1',
      delete_password: 'delete'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      done();
    });
  });

  test('Test GET /view the 10 most recent threads with 3 replies each',  function(done){
    chai.request(server)
    .keepOpen()
    .get('/api/threads/board44')
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.typeOf(res.body, 'array');
      assert.property(res.body[0], '_id');
      assert.property(res.body[0], 'text');
      assert.property(res.body[0], 'created_on');
      assert.property(res.body[0], 'bumped_on');
      assert.property(res.body[0], 'replies');
      assert.equal(res.body[0].text, 'thread1');
      thread_id = res.body[0]._id;
   done()
    });
  });

  test('Test POST /create a new reply', function(done) {
    chai.request(server)
    .keepOpen()
    .post('/api/replies/board44')
    .send({
      thread_id: thread_id,
      text: 'reply1',
      delete_password: 'delete'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      done();
    });
  });

  test('Test GET /view a single thread with all replies',  function(done){
    chai.request(server)
    .keepOpen()
    .get('/api/replies/board44?thread_id='+thread_id)
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.typeOf(res.body, 'object');
      assert.property(res.body, '_id');
      assert.property(res.body, 'text');
      assert.property(res.body, 'created_on');
      assert.property(res.body, 'bumped_on');
      assert.property(res.body, 'replies');
      assert.property(res.body.replies[0], '_id');
      assert.property(res.body.replies[0], 'text');
      assert.property(res.body.replies[0], 'created_on');
      assert.equal(res.body.replies[0].text, 'reply1');
      reply_id = res.body.replies[0]._id;
   done()
    });
  });

  test('Test PUT /report a thread',  function(done){
    chai.request(server)
    .keepOpen()
    .put('/api/threads/board44')
    .send({
      thread_id: thread_id,
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'reported');
   done()
    });
  });

  test('Test PUT /report a reply',  function(done){
    chai.request(server)
    .keepOpen()
    .put('/api/replies/board44')
    .send({
      thread_id: thread_id,
      reply_id: reply_id
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'reported');
   done()
    });
  });

  test('Test DELETE /delete a reply with the incorrect password',  function(done){
    chai.request(server)
    .keepOpen()
    .delete('/api/replies/board44')
    .send({
      thread_id: thread_id,
      reply_id: reply_id,
      delete_password: 'incorrect_password'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'incorrect password');
   done()
    });
  });

  test('Test DELETE /delete a reply with the correct password',  function(done){
    chai.request(server)
    .keepOpen()
    .delete('/api/replies/board44')
    .send({
      thread_id: thread_id,
      reply_id: reply_id,
      delete_password: 'delete'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'success');
   done()
    });
  });

  test('Test DELETE /delete a thread with the incorrect password',  function(done){
    chai.request(server)
    .keepOpen()
    .delete('/api/threads/board44')
    .send({
      thread_id: thread_id,
      delete_password: 'incorrect_password'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'incorrect password');
   done()
    });
  });

  test('Test DELETE /delete a thread with the correct password',  function(done){
    chai.request(server)
    .keepOpen()
    .delete('/api/threads/board44')
    .send({
      thread_id: thread_id,
      delete_password: 'delete'
    })
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.text, 'success');
   done()
    });
  });
});
