import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Cloudflare {
  @Prop({ type: String, default: 'A' })
  type: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Number })
  ttl: number;

  @Prop({ type: Boolean })
  proxied: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CloudflareSchema = SchemaFactory.createForClass(Cloudflare);
