import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type InfoDocument = Document & Info;

@Schema({ timestamps: true, versionKey: false })
export class Info {
  @Prop({ required: true })
  ipInfo: string;
}

export const InfoSchema = SchemaFactory.createForClass(Info);
