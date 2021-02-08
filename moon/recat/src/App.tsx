import React, { useState } from 'react';
import schema from './schema.json';
import './App.css';
import ListView from './listView/listView';
const baseUrl: string = "http://localhost:4000";


function App() {
  const [create, setcreate] = useState(false); // check create data records
  const [isLoading, setIsLoading] = useState(false);
  let data:any = null;
  let modelName:string = '';

  function loadJson() {
    setIsLoading(true);
    const newSchema = Object.values(schema.data);
    modelName = schema.name;
    fetch(baseUrl,{
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "accept": "application/json"
      },
      "body": JSON.stringify({
        newSchema , modelName
      })
    })
    .then(response => {
      console.log(response);
      setIsLoading(false);
      if(response.status == 200)
        setcreate(true);
      else{
        setcreate(false);
      alert("table name exsist in db , you need to change name in schema.json file")
      }
    })
    .catch(err => {
    });

  }
  return (
    <div className="App">
      <button className="btn btn-primary" onClick={loadJson}>Create Data</button>
      {isLoading &&
          <div>Loading...</div>
        }
      <div className="post-container" >
      { create == true ? <ListView data={create}></ListView> : null}

      </div>
    </div>
  );
}

export default App;
