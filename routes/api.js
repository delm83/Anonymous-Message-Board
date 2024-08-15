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
    let issue_list = await Thread.find().select({__v: 0, reported: 0, delete_password: 0});
    return res.json(issue_list);
 }catch(err){return res.json({error: err})}
 });
    
  app.route('/api/replies/:board');

};
