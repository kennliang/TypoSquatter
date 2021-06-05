var express = require('express');
var router = express.Router();
const HCCrawler = require('headless-chrome-crawler');
const puppeteer = require('puppeteer');
const shortid = require('shortid');
const WebsiteTypo = require('.././typo.js');
const mongodb = require('mongodb');

const fs = require('fs');


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var url_collection;
var typo_collection;
var typo_db;

var client = new MongoClient(url,{useUnifiedTopology:true});
client.connect(function(err,db){
  if(err)
    throw new Error("Unable to connect to db "+ err);
  console.log("connected to mongo db");

  typo_db = db.db("typo_db");
  
  typo_db.createCollection("url",function(err,res){
      if(err) throw err;
      //console.log("users collection created!");
      url_collection = typo_db.collection("url");

  });
  typo_db.createCollection("typo_result",function(err,res){
    if(err) throw err;
    typo_collection = typo_db.collection("typo_result");
  })
});

var available_nodes = [];
var queue = [];

router.get('/addnode',function(req,res,next){
  res.render('addnode',{numnodes: available_nodes.length});
});
router.post('/addnode',function(req,res,next){
 
  try{
    const {host,port} = req.body;
    const net = require('net');
    const client = new net.Socket();
    client.connect(Number(port), host, () => {
      console.log('Connected to slave server');
   
      //check if any in queue if so process queue.
      
      if(queue.length != 0)
      {
        let partialqueue = queue.splice(0,20);
        client.write(JSON.stringify(partialqueue));   
      }
      else{
        available_nodes.push(client);
      }
      
      res.render('addnode',{numnodes: available_nodes.length,success_msg: "The worker node was successfuly added to the pool."});
      
    });
    
    client.on('data', function() {
      console.log("yay");
     
      if(queue.length != 0)
      {
        let partialqueue = queue.splice(0,20);
        client.write(JSON.stringify(partialqueue));   
        
      }
      else{
        available_nodes.push(client);
      }
    });

    client.on('close', function() {
      console.log('Connection closed');
      var index = available_nodes.indexOf(client);
      if (index > -1) 
        available_nodes.splice(index, 1);
      client.destroy(); 
    });
    client.on('error',function(){
      //throw new Error("Unable to connect to worker node");
      res.render('addnode',{numnodes: available_nodes.length,error_msg:"Unable to connect to worker node"});
    });
  }
  catch(err){
    console.log("error at /addnode"+err);
    res.render('addnode',{numnodes:available_nodes,error_msg:"Error occured adding worker node "+ err});
  }


  //res.render('addnode',{numnodes: available_nodes.length});
});



function htmlspecialchars(str) {
  if (typeof(str) == "string") {
   str = str.replace(/&/g, "&amp;"); 
   str = str.replace(/"/g, "&quot;");
   str = str.replace(/'/g, "&#039;");
   str = str.replace(/</g, "&lt;");
   str = str.replace(/>/g, "&gt;</br>");
   }
  return str;
  }
/* GET home page. */
router.get('/', function(req, res, next) {
 
  const get = async function(req,res){
    try{

      let result = await url_collection.find({}).toArray();
      //console.log(result);
      res.render('index',{result:result,numnodes:available_nodes.length});

    }
    catch(err)
    {
      console.log("ERROR AT homepage "+ err);
      res.render('error',{message:err});
    }
  } 
  get(req,res);

});

router.get('/scan',function(req,res,next){
  res.render('scan');
});

router.post('/scan',function(req,res,next){

  async function scan(){
    //console.log(req.body);
    try{
      //if(available_nodes.length == 0)
        //throw new Error("There are no slave nodes to process this scan");
      const {url} = req.body;
      console.log(url);
      if(!url.startsWith('www.'))
        throw new Error("url does not begin with www.");
      if(url.endsWith('.com') || url.endsWith('.net') || url.endsWith('.edu') || url.endsWith('.og'))
        console.log("url ends correctly");
      else
        throw new Error("url does not end with a valid extension that can be handled.")
      
      let web_typo = new WebsiteTypo(url);
      web_typo.missing_dot();
      web_typo.char_omission();
      web_typo.char_permut();
      web_typo.char_replace();
      web_typo.char_insert();
      //console.log(web_typo.typo_list);
      //var previous_queue_size = queue.length;
    
      let typo_result = web_typo.typo_list;
      queue = queue.concat(typo_result);
      //console.log(queue);
    
      let input_website_id = shortid.generate();
      
      //typo_result = ['faceboo.com','gokogle.com','googlpe.com'];
      //sockets[0].write(JSON.stringify(typo_result));

      //insert url and typo into db
      var url_obj = {id: input_website_id, url:url,typo_list: typo_result };
      await url_collection.insertOne(url_obj);
      /*
      if(previous_queue_size == 0){
        for(let i = 0 ; i < available_nodes.length ; i++){
          let first_queue_element = queue.shift();
          available_nodes[i].write(JSON.stringify([first_queue_element]));
          available_nodes.shift();
        }
      }*/
      
      let num_split = (queue.length/available_nodes.length).toFixed(0);
      console.log(queue.length,available_nodes.length,num_split);
      //traverse through available_nodes and split the typo_results evenly
      for(let i = 0; i < available_nodes.length; i++){
        if(queue.length != 0)
        {
          let partialqueue = queue.splice(0,20);
          available_nodes[i].write(JSON.stringify(partialqueue)); 
          available_nodes.shift();  
        }
        else{
          break;
        }
      }
      /*
      var timeout = setInterval(function() {
        console.log("queue length "+queue.length);
        console.log("available nodes",available_nodes.length);
        if(queue.length == 0) {
          clearInterval(timeout); 
          //res.redirect('/'+ input_website_id);
        }
    }, 5000);*/

   
      res.render('scan',{numnodes:available_nodes.length,success_msg:"Your scan url request has been added to the queue"});

      //res.redirect('/'+ input_website_id);
    }
    catch(err){
      console.log("error at scan " + err);
      res.render('scan',{error_msg:"Error trying to add a scan url request"+ err});
    }
  }
  scan(req,res);
  

});

function retrieveimg(imgid){
  let bucket = new mongodb.GridFSBucket(typo_db, {
    bucketName: 'images'
  });

  let downloadStream = bucket.openDownloadStream(imgid);
  let chunks;
  let completed = false;
  downloadStream.on('data', (chunk) => {
    console.log(chunk);
    chunks += chunk;
    //result2.img += chunk;
  });
  downloadStream.on('end',() =>{
    completed = true;
  });
  var timeout = setInterval(function() {
   
    if(completed == true) {
      clearInterval(timeout); 
      return chunks;
      //res.redirect('/'+ input_website_id);
    }
}, 500);
}

router.get('/item/:id',function(req,res,next){
  const getid = async function(req,res){
    //try
    //{
      //find the id in db and get content

      let result = await url_collection.findOne({id: req.params.id});
      if(result == null)
        throw new Error("Unable to find report of given id");

      let typo_list_data = [];
      let found_count = 0;
      let image_found = 0;

      for(let i = 0 ; i < result.typo_list.length; i++){
        //traverse through the list and find each typo in typo_collection
        let result2 = await typo_collection.findOne({url: 'https://'+result.typo_list[i]+'/'});
        if(result2 != null)
        {
          let bucket = new mongodb.GridFSBucket(typo_db, {
            bucketName: 'images'
          });
          bucket.openDownloadStream(result2.imgid).
          pipe(fs.createWriteStream('public/images/'+result2.imgid+'.png')).
          on('error', function(error) {
            //assert.ifError(error);
            console.log("error"+error);
          }).
          on('end', function() {
            console.log('done!');
           
          });
          
          //console.log(chunks);
          console.log("end");
         
      
          typo_list_data.push(result2);
        }
      }
      //do report html now
      res.render('report',{result: typo_list_data});
    /*
    }
    
    catch(err)
    {
      console.log("ERROR at report of url " + err);
      res.render('error',{message: err})
    }*/
  }
  getid(req,res);
  
});

router.get('/reset',function(req,res,next){
  res.render('reset');
});

router.post('/reset',function(req,res,next){
  const resetdb = async function(req,res)
  {
    try{
      queue = [];
    console.log("reset db called");
    let result = await url_collection.drop();
    let result2 = await typo_collection.drop();
    typo_db.createCollection("url",function(err){
      if(err){
        console.log("error creating collection " + err);
        res.render('reset',{error_msg: "Error occured at reset"+ err})
      }
      //console.log("users collection created!");
      url_collection = typo_db.collection("url");
      typo_db.createCollection("typo_result",function(err){
        if(err){
          res.render('reset',{error_msg: "Error occured at reset"+ err})
          console.log("error creating collection " + err); 
        }
        typo_collection = typo_db.collection("typo_result");
      })
      res.render('reset',{success_msg: "Collections in the database has been reset and the queue has been emptyed"});
    });
  }
  catch(err){
    res.render('reset',{error_msg: "Error occured at reset"+ err})
  }
}
  resetdb(req,res);
});


module.exports = router;
