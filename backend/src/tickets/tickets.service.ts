import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto, AddMessageDto, AdminCreateTicketDto } from './dto/ticket.dto';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    userId: string,
    userName: string,
    userEmail: string,
    createTicketDto: CreateTicketDto,
  ): Promise<TicketDocument> {
    const ticket = new this.ticketModel({
      userId,
      userName,
      userEmail,
      subject: createTicketDto.subject,
      priority: createTicketDto.priority || 'medium',
      messages: [
        {
          senderId: userId,
          senderRole: 'user',
          senderName: userName,
          message: createTicketDto.message,
        },
      ],
    });
    return ticket.save();
  }

  async findAll(): Promise<TicketDocument[]> {
    return this.ticketModel.find().sort({ updatedAt: -1 });
  }

  async findByUser(userId: string): Promise<TicketDocument[]> {
    return this.ticketModel.find({ userId }).sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    return ticket;
  }

  async addMessage(id: string, senderId: string, dto: AddMessageDto): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');

    ticket.messages.push({
      senderId: senderId as any,
      senderRole: dto.senderRole,
      senderName: dto.senderName,
      message: dto.message,
    } as any);

    if (dto.senderRole === 'admin') {
      ticket.status = 'pending';
    } else {
      ticket.status = 'open';
    }

    return ticket.save();
  }

  async updateStatus(id: string, status: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    return ticket;
  }

  async countOpen(): Promise<number> {
    return this.ticketModel.countDocuments({ status: { $ne: 'closed' } });
  }

  async adminCreateTicket(dto: AdminCreateTicketDto, adminId: string, adminName: string): Promise<TicketDocument> {
    const targetUser = await this.userModel.findById(dto.userId);
    if (!targetUser) throw new NotFoundException('کاربر مورد نظر یافت نشد');

    const ticket = new this.ticketModel({
      userId: dto.userId,
      userName: targetUser.fullName || targetUser.mobile,
      userEmail: targetUser.email || targetUser.mobile,
      subject: dto.subject,
      priority: dto.priority || 'medium',
      status: 'pending',
      messages: [
        {
          senderId: adminId,
          senderRole: 'admin',
          senderName: adminName,
          message: dto.message,
        },
      ],
    });
    return ticket.save();
  }

  async assignAdmin(ticketId: string, adminId: string): Promise<TicketDocument> {
    const admin = await this.userModel.findById(adminId);
    if (!admin) throw new NotFoundException('ادمین مورد نظر یافت نشد');
    if (admin.role !== UserRole.ADMIN) {
      throw new BadRequestException('کاربر انتخاب شده ادمین نیست');
    }

    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');

    ticket.assignedAdminId = admin._id as any;
    ticket.assignedAdminName = admin.fullName || admin.username || admin.mobile;
    ticket.assignedAt = new Date();

    return ticket.save();
  }

  async unassignAdmin(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');

    ticket.assignedAdminId = null;
    ticket.assignedAdminName = null;
    ticket.assignedAt = null;

    return ticket.save();
  }

  async findAllAdmins(): Promise<any[]> {
    const admins = await this.userModel
      .find({ role: UserRole.ADMIN, isActive: true })
      .select('_id fullName username mobile email avatar permissions');
    return admins.map((a) => ({
      _id: a._id,
      fullName: a.fullName,
      username: a.username,
      mobile: a.mobile,
      email: a.email,
      avatar: a.avatar,
      permissions: a.permissions,
    }));
  }

  async findByAssignedAdmin(adminId: string): Promise<TicketDocument[]> {
    return this.ticketModel
      .find({ assignedAdminId: adminId })
      .sort({ updatedAt: -1 });
  }
}
