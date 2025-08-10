import { Types } from "mongoose";

export enum PStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  STOCK_OUT = "STOCK_OUT",
}

export interface IProduct {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  newPrice: number;
  oldPrice?: number;
  costPrice?: number;
  quantity: number;
  status: PStatus;
  description?: string;
  images?: string[];
  deleteImages?: string[];
  createdAt?: Date;
}
