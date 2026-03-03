export default function BlogCard({ blog }) {
  return (
    <div className="border p-6 rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {blog.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base md:text-base lg:text-base line-clamp-4">
          {blog.description}
        </p>
      </div>
      <a
        href={`blogs/${blog._id}`}
        className="text-blue-600 font-semibold hover:underline mt-auto"
      >
        আরও পড়ুন
      </a>
    </div>
  );
}
