/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errors/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...restPayload } = payload;

  const isUserExists = await User.findOne({ email });
  if (isUserExists)
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!");

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...restPayload,
  });

  const { password: pass, ...restUser } = user.toObject();
  return restUser;
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUser = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUser,
    },
  };
};

const getMe = async (userId: string) => {
  const me = await User.findById(userId).select("-password");
  if (!me) throw new AppError(httpStatus.NOT_FOUND, "User does not exists!");
  return me;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.USER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized!");
    }
  }

  const isUserExits = await User.findById(userId);
  if (!isUserExits)
    throw new AppError(httpStatus.NOT_FOUND, "User does not exists!");

  if (
    (decodedToken.role === Role.ADMIN &&
      isUserExits.role === Role.SUPER_ADMIN) ||
    (decodedToken.role === Role.USER && isUserExits.role === Role.ADMIN)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  /**
   * only admin/superAdmin can update -> role, isVerified
   */

  if (payload.role || payload.isVerified) {
    if (decodedToken.role === Role.USER)
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  const updateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return updateUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  getMe,
  updateUser,
};
