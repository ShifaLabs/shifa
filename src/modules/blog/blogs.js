"use server";

import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";

export async function getBlogs({ page = 1, limit = 12 } = {}) {
  const blogsCollection = await dbConnect(collections.BLOGS);

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 6;
  const skip = (safePage - 1) * safeLimit;

  const [blogs, total] = await Promise.all([
    blogsCollection
      .find(
        { status: "published" },
        {
          projection: {
            title: 1,
            description: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),
    blogsCollection.countDocuments({ status: "published" }),
  ]);

  const serializedBlogs = blogs.map((blog) => ({
    _id: blog._id.toString(),
    title: blog.title,
    description: blog.description,
  }));

  return {
    data: serializedBlogs,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

export async function getBlogById(blogId) {
  if (!blogId || !ObjectId.isValid(blogId)) {
    throw new Error("Invalid Blog ID");
  }

  const blogsCollection = await dbConnect(collections.BLOGS);

  const blog = await blogsCollection.findOne(
    { _id: new ObjectId(blogId), status: "published" },
    {
      projection: {
        title: 1,
        tags: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );

  if (!blog) {
    throw new Error("Blog not found");
  }
  return {
    ...blog,
    _id: blog._id.toString(),
    createdAt:
      blog.createdAt instanceof Date
        ? blog.createdAt.toISOString()
        : blog.createdAt,
    updatedAt:
      blog.updatedAt instanceof Date
        ? blog.updatedAt.toISOString()
        : blog.updatedAt,
  };
}
