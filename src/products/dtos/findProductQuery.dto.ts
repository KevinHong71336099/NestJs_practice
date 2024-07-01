import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class FindProductQuery {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    page: number;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    limit: number;

    @IsString()
    @IsNotEmpty()
    orderBy: string;

    @IsString()
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    priceGreatThan?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    priceLessThan?: number
}