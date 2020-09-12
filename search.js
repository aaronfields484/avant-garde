exports.getTitle = (data, key)=>{
  for(var i = 0; i < data.length; i++){
    console.log(data[i].link.substr(5,data[i].link.length));
    if(data[i].link.substr(5,data[i].link.length) === key){
      return data[i].title;
      break;
    }
  }
}

exports.getMessage = (data, key)=>{
  for(var i = 0; i < data.length; i++){
    console.log(data[i].link.substr(5,data[i].link.length));
    if(data[i].link.substr(5,data[i].link.length) === key){
      return data[i].message;
      break;
    }
  }
}
