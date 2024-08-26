'use strict';

module.exports = function (app) {

  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
  
  let Schema = mongoose.Schema;

  let threadSchema = new Schema({
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
     let Thread = mongoose.model(board, threadSchema);
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
    let Thread = mongoose.model(board, threadSchema);
    let thread_list = await Thread.find().select({__v: 0, reported: 0, delete_password: 0}).sort({ bumped_on: -1 }).limit(10);
    for(let x=0; x<thread_list.length; x++){
      thread_list[x].replies = thread_list[x].replies.slice(-3);
      for(let y=0; y<thread_list[x].replies.length; y++)
        thread_list[x].replies[y] = {"_id": thread_list[x].replies[y]._id, "text": thread_list[x].replies[y].text, "created_on": thread_list[x].replies[y].created_on}
    }
    return res.json(thread_list);
 }catch(err){return res.json({error: err})}
 }).delete(async (req, res)=>{
  try{
   let board = req.params.board;
   let Thread = mongoose.model(board, threadSchema);
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
      let Thread = mongoose.model(board, threadSchema);
      let thread_id = req.body.thread_id;
      let text = req.body.text
      let delete_password = req.body.delete_password
      let input_thread = await Thread.findById(thread_id);
      let inputReply = new Thread({
       text: text,
       delete_password: delete_password,
       created_on: new Date(),
 });
   input_thread.bumped_on = new Date();
   input_thread.replies.push({"_id": inputReply._id, "text": inputReply.text, "created_on": inputReply.created_on});
   await input_thread.save();
   return res.redirect('/b/'+board+'/'+thread_id);
  }catch(err){return res.json({error: err})}
  }).get(async (req, res)=>{
    try{
     let board = req.params.board;
     let Thread = mongoose.model(board, threadSchema);
     let thread_id = req.query.thread_id;
     let input_thread = await Thread.findById(thread_id).select({__v: 0, reported: 0, delete_password: 0});
     return res.json(input_thread);
  }catch(err){return res.json({error: err})}
  });
};
