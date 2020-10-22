import { prop } from "@typegoose/typegoose";

export class Entry {
    @prop()
    date: any;

    @prop()
    meterId: string;

    @prop()
    value: any;
}