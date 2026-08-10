import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TicketMessageDocument = HydratedDocument<TicketMessage>;

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'admin'] })
  senderRole: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  message: string;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: String, enum: ['open', 'pending', 'closed'], default: 'open' })
  status: string;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedAdminId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  assignedAdminName: string | null;

  @Prop({ type: Date, default: null })
  assignedAt: Date | null;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
