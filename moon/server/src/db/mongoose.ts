import mongoose from "mongoose";

export const connectToDB = () => {
//   mongoose.set('debug',(collectionName: any, method: any, query: any, doc: any, options: any) => {
//     Logger.Info(`col.method: ${collectionName}.${method}\n query: ${JSON.stringify(query)}\n doc: ${doc}\n opt: ${JSON.stringify(options)}`);
// });
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGO_URI!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(resolve)
      .catch(reject);
  });
};
