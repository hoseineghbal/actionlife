import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { StoreService } from './store.service';
import { CreateProductDto, UpdateProductDto } from './dto/store.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('seller') seller?: string,
  ) {
    return this.storeService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category,
      search,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      seller,
    });
  }

  @Get('products/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    const product = await this.storeService.findBySlug(slug);
    const user = req.user;
    let hasPurchased = false;
    if (user) {
      hasPurchased = await this.storeService.hasPurchased(
        product._id.toString(),
        user.userId,
      );
    }
    return { ...product.toObject(), hasPurchased };
  }

  @Post('products')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.storeService.create(dto, req.user.userId);
  }

  @Put('products/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.storeService.update(id, dto, req.user.userId);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.storeService.remove(id, req.user.userId);
  }

  @Post('purchase')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async purchase(@Body('productId') productId: string, @Req() req: any) {
    return this.storeService.purchase(productId, req.user.userId);
  }

  @Get('my-purchases')
  @UseGuards(AuthGuard('jwt'))
  async myPurchases(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.getUserPurchases(
      req.user.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('my-products')
  @UseGuards(AuthGuard('jwt'))
  async myProducts(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.getSellerProducts(
      req.user.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('seller-orders')
  @UseGuards(AuthGuard('jwt'))
  async sellerOrders(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.getSellerOrders(
      req.user.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('purchased/:productId')
  @UseGuards(AuthGuard('jwt'))
  async checkPurchased(
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    const purchased = await this.storeService.hasPurchased(
      productId,
      req.user.userId,
    );
    return { purchased };
  }

  // Admin routes
  @Get('admin/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminFindAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.storeService.adminFindAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      sort,
    });
  }

  @Get('admin/products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminFindById(@Param('id') id: string) {
    return this.storeService.adminFindById(id);
  }

  @Put('admin/products/:id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.storeService.adminUpdateStatus(id, status);
  }

  @Get('product/:id')
  async findById(@Param('id') id: string) {
    return this.storeService.findById(id);
  }
}
