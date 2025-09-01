import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductDto,
  ProductResponseDto,
} from '../dto';
import { PaginatedData } from '../../common/interfaces';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiFile } from '../../common/decorators/api-file.decorator';
import {
  CreateProductDecorator,
  FindAllProductDecorator,
  FindByIdProductDecorator,
  UpdateProductDecorator,
  DeleteProductDecorator,
  SearchProductDecorator,
} from '../decorators';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @CreateProductDecorator()
  @ApiFile('picture')
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.createWithFile(createProductDto, file);
  }

  @Get()
  @FindAllProductDecorator()
  findAll(): Promise<PaginatedData<ProductResponseDto>> {
    return this.productsService.findAll();
  }

  @Post('search')
  @SearchProductDecorator()
  search(@Body() searchDto: SearchProductDto): Promise<PaginatedData<ProductResponseDto>> {
    return this.productsService.search(searchDto);
  }

  @Get(':id')
  @FindByIdProductDecorator()
  findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UpdateProductDecorator()
  @ApiFile('picture')
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateWithFile(id, updateProductDto, file);
  }

  @Delete(':id')
  @DeleteProductDecorator()
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }
}
