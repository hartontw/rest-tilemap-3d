import {Schema, model} from 'mongoose'

const integer = {
    type: Number,
    required: true,
    set: v => Math.floor(v),
}

const blockSchema = new Schema({
    x: integer,
    y: integer,
    z: integer,
    updated: { type: Date, default: Date.now },
    info: Schema.Types.Mixed
})

blockSchema.index({ x: 1, y: 1, z:1 }, { unique: true });

export default model("blocks", blockSchema)