/* eslint-disable @typescript-eslint/no-explicit-any */

import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();
  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const usersByRolePromise = User.aggregate([
    // stage - 1: Grouping users by role and count total users in each role
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [totalUser, newUsersInLast7Days, newUsersInLast30Days, usersByRole] =
    await Promise.all([
      totalUsersPromise,

      newUsersInLast7DaysPromise,
      newUsersInLast30DaysPromise,
      usersByRolePromise,
    ]);

  return {
    totalUser,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  };
};

const getProductStats = async () => {
  const totalProductPromise = Product.countDocuments();

  const [totalProduct] = await Promise.all([totalProductPromise]);

  return {
    totalProduct,
    // avgTourCost,
    // totalTourByDivision,
    // totalHighestBookedTour,
  };
};

const getOrderStats = async () => {
  const totalOrderPromise = Order.countDocuments();
  const totalOrderByStatusPromise = Order.aggregate([
    // Stage-1: group stage
    {
      $group: {
        _id: "$status",
        const: { $sum: 1 },
      },
    },
  ]);

  const ordersLast7DaysPromise = Order.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const ordersLast30DaysPromise = Order.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalOrderByUniqueUsersPromise = Order.distinct("user").then(
    (user: any) => user.length
  );

  const [
    totalOrder,
    totalOrderByStatus,
    ordersLast30Days,
    totalOrderByUniqueUsers,
  ] = await Promise.all([
    totalOrderPromise,
    totalOrderByStatusPromise,
    ordersLast7DaysPromise,
    ordersLast30DaysPromise,
    totalOrderByUniqueUsersPromise,
  ]);
  return {
    totalOrder,
    totalOrderByStatus,
    ordersLast30Days,
    totalOrderByUniqueUsers,
  };
};

export const StatsService = {
  getUserStats,
  getProductStats,
  getOrderStats,
};
