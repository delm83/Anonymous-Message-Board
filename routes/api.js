'use strict';

module.exports = function (app) {

  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
  
  let Schema = mongoose.Schema;

  let postSchema = new Schema({
    text: {
      type: String,
      required: true,
      default: ''
    },
    delete_password: {
      type: String,
      required: true,
      default: ''
    },
    created_on: Date,
    bumped_on: Date,
    reported: {
      type: Boolean,
      default: false},
    replies: Array
 });

 app.route('/api/threads/:board')
 .post(async (req, res)=>{
   try{
     let board = req.params.board;
     let Thread = mongoose.model(board, postSchema);
     let text = req.body.text
     let delete_password = req.body.delete_password
     let inputThread = new Thread({
      text: text,
      delete_password: delete_password,
      created_on: new Date(),
      bumped_on: new Date()
});
  await inputThread.save();
  return res.redirect('/b/'+board);
 }catch(err){return res.json({error: err})}
 }).get(async (req, res)=>{
   try{
    let board = req.params.board;
    let Thread = mongoose.model(board, postSchema);
    let thread_list = await Thread.find().select({__v: 0, reported: 0, delete_password: 0}).sort({ bumped_on: -1 }).limit(10);
    let output = thread_list.map(thread=> 
    { return {
      "_id": thread._id, "text": thread.text, "created_on": thread.created_on, "bumped_on": thread.bumped_on, "replies": thread.replies.slice(-3).map(reply =>{
        return {
          "_id": reply._id, "text": reply.text, "created_on": reply.created_on,
        }
      })
    }
    })
    return res.json(output);
 }catch(err){return res.json({error: err})}
 }).delete(async (req, res)=>{
  try{
   let board = req.params.board;
   let Thread = mongoose.model(board, postSchema);
   let thread_id = req.body.thread_id;
   let delete_password = req.body.delete_password;
   let deleted_post = await Thread.deleteOne({ _id: thread_id, delete_password: delete_password });
   return deleted_post.deletedCount==0?
   res.type('txt').send('incorrect password')
  :res.type('txt').send('success');
}catch(err){return res.json({error: err})}
});
    
  app.route('/api/replies/:board').post(async (req, res)=>{
    try{
      let board = req.params.board;
      let Reply = mongoose.model(board, postSchema);
      let thread_id = req.body.thread_id;
      let text = req.body.text
      let delete_password = req.body.delete_password
      let input_thread = await Reply.findById(thread_id);
      let inputReply = new Reply({
       text: text,
       delete_password: delete_password,
       created_on: new Date(),
 });
   input_thread.bumped_on = new Date();
   input_thread.replies.push(inputReply);
   await input_thread.save();
   return res.redirect('/b/'+board+'/'+thread_id);
  }catch(err){return res.json({error: err})}
  }).get(async (req, res)=>{
    try{
     let board = req.params.board;
     let Thread = mongoose.model(board, postSchema);
     let thread_id = req.query.thread_id;
     let input_thread = await Thread.findById(thread_id).select({__v: 0, reported: 0, delete_password: 0});
     let output = {
      _id: input_thread._id,
      text: input_thread.text,
      created_on: input_thread.created_on,
      bumped_on: input_thread.bumped_on,
      replies: input_thread.replies.map(reply => {
        return {
          "_id": reply._id, "text": reply.text, "created_on": reply.created_on,
        }
      })
    }
     return res.json(output);
  }catch(err){return res.json({error: err})}
  }).delete(async (req, res)=>{
    try{
     let board = req.params.board;
     let Reply = mongoose.model(board, postSchema);
     let thread_id = req.body.thread_id;
     let reply_id = req.body.reply_id
     let delete_password = req.body.delete_password;
     let deleted_post = await Reply.findById(thread_id);
    for(let reply of deleted_post.replies){
      if(reply._id == reply_id && reply.delete_password==delete_password){
        reply.text = '[deleted]';
        deleted_post.markModified('replies');
          await deleted_post.save();
          return res.type('txt').send('success');
      }
     }
     return res.type('txt').send('incorrect password')
  }catch(err){return res.json({error: err})}
  });
};
