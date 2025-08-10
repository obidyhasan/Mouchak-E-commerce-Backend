import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { ICart } from "./cart.interface";
import { Cart } from "./cart.model";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";

const createCart = async (
  payload: Partial<ICart>,
  decodedToken: JwtPayload
) => {
  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exits!");

  const isProductDuplicated = await Cart.findOne({
    _id: decodedToken.userId,
    product: payload.product,
  });
  if (isProductDuplicated)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product size already exits in cart!"
    );

  const isProductExits = await Product.findById(payload.product);
  if (!isProductExits)
    throw new AppError(httpStatus.NOT_FOUND, "Product does not exits!");

  const amount = Number(payload.quantity) * Number(isProductExits.newPrice);

  const cart = await Cart.create({
    ...payload,
    user: decodedToken.userId,
    amount,
  });

  isUserExits.carts?.push(cart._id);
  await isUserExits.save();

  return cart;
};

const getAllCart = async () => {
  const carts = await Cart.find({})
    .populate("user", "name email role carts orders")
    .populate("product");

  const totalCarts = await Cart.countDocuments();

  return {
    data: carts,
    meta: {
      total: totalCarts,
    },
  };
};

const getMyCart = async (decodedToken: JwtPayload) => {
  const carts = await Cart.find({ user: decodedToken.userId })
    .populate("user", "name email role carts orders")
    .populate("product");

  const totalCarts = await Cart.countDocuments({ user: decodedToken.userId });

  return {
    data: carts,
    meta: {
      total: totalCarts,
    },
  };
};

const updateCart = async (cartId: string, payload: Partial<ICart>) => {
  const isCartExits = await Cart.findById(cartId);
  if (!isCartExits)
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid cart id.");

  const isProductExits = await Product.findById(isCartExits.product);
  if (!isProductExits)
    throw new AppError(httpStatus.NOT_FOUND, "Product does not exits!");

  let amount = isCartExits.amount;
  if (payload.quantity) {
    amount = Number(payload.quantity) * Number(isProductExits.newPrice);
  }
  payload.amount = amount;

  const cart = await Cart.findByIdAndUpdate(cartId, payload, {
    new: true,
    runValidators: true,
  });

  return cart;
};

const deleteCart = async (cartId: string, decodedToken: JwtPayload) => {
  const isCartExits = await Cart.findById(cartId);
  if (!isCartExits)
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid cart id.");

  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.NOT_FOUND, "User does not exits");

  await Cart.findByIdAndDelete(cartId);

  isUserExits.carts = isUserExits.carts?.filter(
    (cartItem) => cartItem.toString() !== cartId
  );
  await isUserExits.save();
};

export const CartService = {
  createCart,
  getAllCart,
  getMyCart,
  updateCart,
  deleteCart,
};
