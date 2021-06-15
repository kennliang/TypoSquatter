var express = require('express');
var router = express.Router();
const shortid = require('shortid');
const WebsiteTypo = require('../models/typo.js');
const mq = require('../connections/rabbitmq.js')()
const cassandra = require('../connections/cassandra.js')

function htmlspecialchars(str) 
{
  if (typeof(str) == "string") 
  {
    str = str.replace(/&/g, "&amp;"); 
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;</br>");
  }
  return str;
}


router.post('/scan',function(req,res,next){

  const scan = async function(req,res){
    
    try
    {
      const {url} = req.body;
      if(!url.startsWith('www.'))
        res.status(400).send({"status": "ERROR", "Message":"URL does not begin with www"});
      if(url.endsWith('.com') || url.endsWith('.net') || url.endsWith('.edu') || url.endsWith('.og'))
        ;
      else
        res.status(400).send({"status": "ERROR", "Message": "Invalid URL extension"})
     
      
      console.log("wre")

      let web_typo = new WebsiteTypo(url);
      web_typo.missing_dot();
      web_typo.char_omission();
      web_typo.char_permut();
      web_typo.char_replace();
      web_typo.char_insert();
      
      let typo_result = web_typo.typo_list;
      let input_website_id = shortid.generate();

      for(let i = 0; i < typo_result.length; i++)
      {
      
    
      }

      res.status(200).send({"status": "OK"});
    }
    catch(err)
    {
      console.log(err)
      res.status(400).send({})
    }

  }
  scan(req,res);

});




router.get('/item/:id',function(req,res,next){
  const getid = async function(req,res)
  {
    try
    {

    }
    catch(err)
    {

    }

  }
  getid(req,res);
  
});



module.exports = router;
