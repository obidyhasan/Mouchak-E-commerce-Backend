import { model, Schema } from "mongoose";
import { ICart } from "./cart.interface";

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    amount: { type: Number },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Cart = model<ICart>("Cart", cartSchema);
