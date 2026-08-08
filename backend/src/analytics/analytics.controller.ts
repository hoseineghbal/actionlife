import { Controller, Get, Post, Body, Query, UseGuards, Request, Ip, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreatePageViewDto } from './dto/pageview.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ContactService } from '../contact/contact.service';
import { TicketsService } from '../tickets/tickets.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly usersService: UsersService,
    private readonly contactService: ContactService,
    private readonly ticketsService: TicketsService,
  ) {}

  @Post('track')
  track(
    @Body() dto: CreatePageViewDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.analyticsService.trackView(dto, undefined, ip, userAgent);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOverview() {
    const [users, contacts, openTickets] = await Promise.all([
      this.usersService.findAll(),
      this.contactService.findAll(),
      this.ticketsService.countOpen(),
    ]);
    return this.analyticsService.getOverview(
      users.length,
      contacts.length,
      openTickets,
    );
  }

  @Get('admin-dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAdminDashboard(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const [overview, dashboard] = await Promise.all([
      (async () => {
        const [users, contacts, openTickets] = await Promise.all([
          this.usersService.findAll(),
          this.contactService.findAll(),
          this.ticketsService.countOpen(),
        ]);
        return this.analyticsService.getOverview(users.length, contacts.length, openTickets);
      })(),
      this.analyticsService.getAdminDashboard(from, to),
    ]);
    return { ...overview, ...dashboard };
  }
}
