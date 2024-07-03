import { Module } from "@nestjs/common";
import { ProductsModule } from "src/products/products.module";
import { GuestController } from "./guest.controller";

@Module({
    imports: [ProductsModule],
    controllers: [GuestController]
})

export class GuestModule { }