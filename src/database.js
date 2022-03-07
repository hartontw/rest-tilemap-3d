import mongoose from "mongoose";

mongoose.plugin((schema) => {
    schema.options.toJSON = {
        virtuals: false,
        versionKey: false,
        transform(doc, ret) {
            delete ret._id;
        }
    };
});

export default async (connection) => {
    await mongoose.connect(connection)        
}