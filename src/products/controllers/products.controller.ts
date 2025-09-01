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
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, SearchProductDto } from '../dto';
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
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (!file) {
      throw new BadRequestException('Product picture is required');
    }

    const productData = {
      ...createProductDto,
      picture: file.path,
    };

    return this.productsService.create(productData);
  }

  @Get()
  @FindAllProductDecorator()
  findAll() {
    return this.productsService.findAll();
  }

  @Post('search')
  @SearchProductDecorator()
  async search(@Body() searchDto: SearchProductDto) {
    return this.productsService.search(searchDto);
  }

  @Get(':id')
  @FindByIdProductDecorator()
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UpdateProductDecorator()
  @ApiFile('picture')
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updateData = {
      ...updateProductDto,
      ...(file && { picture: file.path }),
    };

    return this.productsService.update(id, updateData);
  }

  @Delete(':id')
  @DeleteProductDecorator()
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
