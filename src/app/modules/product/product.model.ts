import { model, Schema } from "mongoose";
import { IProduct, PStatus } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    category: { type: String, required: true },
    newPrice: { type: Number, required: true },
    oldPrice: { type: Number },
    costPrice: { type: Number },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PStatus),
      default: PStatus.ACTIVE,
    },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = this.name.toLowerCase().split(" ").join("-");

    let slug = baseSlug;
    let counter = 0;
    while (await Product.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  const product = this.getUpdate() as Partial<IProduct>;

  if (product.name) {
    const baseSlug = product.name.toLowerCase().split(" ").join("-");

    let slug = baseSlug;
    let counter = 0;
    while (await Product.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    product.slug = slug;
  }

  this.setUpdate(product);
  next();
});

export const Product = model<IProduct>("Product", productSchema);
