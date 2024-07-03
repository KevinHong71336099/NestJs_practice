import { Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { ProductsService } from "src/products/products.service";
import { UserDataDto } from "src/users/dtos/userData.dto";

@Controller('guest')
export class GuestController {
    constructor(private productsService: ProductsService) { }

    // Product services
    @Post('/products/:id/addToCart')
    async addProductToCart(@Param('id') id: string, @Req() req: Request | any): Promise<string> {
        const guest = req.user as UserDataDto
        return await this.productsService.addToCart(guest.id, id)
    }

    @Delete('/products/:id/deleteFromCart')
    async deleteProductFromCart(@Param('id') id: string, @Req() req: Request | any): Promise<string> {
        const guest = req.user as UserDataDto
        return await this.productsService.deleteFromCart(guest.id, id)
    }
}