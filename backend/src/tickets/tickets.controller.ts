import {
  Controller, Get, Post, Put, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, AddMessageDto, UpdateTicketStatusDto, AdminCreateTicketDto, AssignTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(
      req.user.userId,
      req.user.fullName || req.user.email,
      req.user.email || req.user.mobile || `${req.user.userId}@actionlife.local`,
      dto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyTickets(@Request() req: any) {
    return this.ticketsService.findByUser(req.user.userId);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAllAdmins() {
    return this.ticketsService.findAllAdmins();
  }

  @Get('admin/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findMyAssignedTickets(@Request() req: any) {
    return this.ticketsService.findByAssignedAdmin(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AddMessageDto,
  ) {
    return this.ticketsService.addMessage(id, req.user.userId, dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.ticketsService.updateStatus(id, dto.status);
  }

  @Put(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  assignAdmin(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assignAdmin(id, dto.adminId);
  }

  @Put(':id/unassign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  unassignAdmin(@Param('id') id: string) {
    return this.ticketsService.unassignAdmin(id);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminCreateTicket(@Request() req: any, @Body() dto: AdminCreateTicketDto) {
    return this.ticketsService.adminCreateTicket(
      dto,
      req.user.userId,
      req.user.fullName || 'ادمین',
    );
  }
}
