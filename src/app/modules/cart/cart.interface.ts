import { Types } from "mongoose";

export interface ICart {
  user: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  amount: number;
  createdAt?: Date;
}
