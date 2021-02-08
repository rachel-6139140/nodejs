import mongoose from "mongoose";
import { Controller,Get,Post,Delete,Patch} from "@overnightjs/core";
import { Request, Response } from "express";

const Schema = mongoose.Schema;
var typeMappings:any  =
{"String":String,
 "Date":Date,
 "Boolean":Boolean,
 "Number":Number
   //....etc
}
var SchemaRachel:any;
var newSchema:any;

function makeSchema(newSchema: any){
    var productJson:any = {}
    for(const data in newSchema){
      var fieldType = newSchema[data].type;
      console.log(typeMappings[fieldType])
      if(typeMappings[fieldType]){
        productJson[newSchema[data].fieldName] = {
          type: typeMappings[fieldType],
          default: '',
        }
     }
    }
    return new mongoose.Schema(productJson)
  }
@Controller("")
export class ListController {
    @Post("")
    private async loadJson(req: Request, res: Response) {
      const { modelName} = req.body ;
      newSchema = req.body.newSchema;
        var schema = makeSchema(newSchema); //create schema object
        SchemaRachel = await mongoose.model(modelName, schema);
        var maxReq = 10000;// 10,000
        var records = [];
          var i = 0, len = maxReq;
          while (i < len) { //faster loop for 10000 records
          var newRecord:any = {}
          for(const data in newSchema){
            const typeField = newSchema[data].type ;
            console.log(typeField);
            if(typeField == "String")
              newRecord[newSchema[data].fieldName] = "test " + newSchema[data].fieldName + " " +i;
           if(typeField == "Date")
              newRecord[newSchema[data].fieldName] = new Date();
            if(typeField == "Number")
            newRecord[newSchema[data].fieldName] = Number(data);
          }
          records.push(newRecord);
            i++
          }
         await SchemaRachel.insertMany(records);
          res.send("data create");
    }


    @Get("")
    private async getData(req: Request, res: Response) {
      var limit = 15;
      var skip;
      const step:any  = req.query.length;
      const direction:any  = req.query.direction;
      if(direction == 'up')
         skip = 1*step; // get the next rows
      else
        skip = step-60-15;  // get the previous rows
      const data = await SchemaRachel.find().limit(limit).skip(skip);
      return res.send(data);
    }
  @Delete(":_id")
  private async delete(req: Request, res: Response) {
    const { _id } = req.params;
    const doc = await SchemaRachel.findOneAndRemove({ _id: _id });
    res.send(doc ? "row was deleted sucessufly" : {});
  }
  @Post("add")
  private async duplicate(req: Request, res: Response) {
    const  data = req.body;
    var myData = await new SchemaRachel(data);
    await myData.save();
    res.status(201).send(myData);
  }
    @Patch()
   private async update(req: Request, res: Response) {
    const { id, valueForm } = req.body;
    const updateRow = await SchemaRachel.findOneAndUpdate(
      { _id: id },
      { $set:  valueForm  },
      { new: true }
    );
    res.status(202).send(updateRow);
  }
}
