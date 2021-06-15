var express = require('express');
var router = express.Router();
const shortid = require('shortid');
const WebsiteTypo = require('.././typo.js');


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

  async function scan(){
    try
    {
      const {url} = req.body;
      if(!url.startsWith('www.'))
        throw new Error("url does not begin with www.");
      if(url.endsWith('.com') || url.endsWith('.net') || url.endsWith('.edu') || url.endsWith('.og'))
        ;
      else
        throw new Error("url does not end with a valid extension that can be handled.")
      
      let web_typo = new WebsiteTypo(url);
      web_typo.missing_dot();
      web_typo.char_omission();
      web_typo.char_permut();
      web_typo.char_replace();
      web_typo.char_insert();
      
      let typo_result = web_typo.typo_list;
      let input_website_id = shortid.generate();
      
  
    }
    catch(err)
    {
      console.log("error at scan " + err);
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
