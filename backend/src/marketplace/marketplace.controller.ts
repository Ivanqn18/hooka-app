import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('products')
  createProduct(@Body() createProductDto: CreateMarketplaceDto) {
    return this.marketplaceService.createProduct(createProductDto);
  }

  @Get('products')
  findAllProducts(@Query() query: any) {
    // query parsing is handled inside service, but we could improve it here too
    return this.marketplaceService.findAllProducts(query);
  }

  @Get('products/:id')
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.findOneProduct(id);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateMarketplaceDto,
  ) {
    return this.marketplaceService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.removeProduct(id);
  }
}

