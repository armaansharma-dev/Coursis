import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaUsers, FaBook, FaArrowRight } from 'react-icons/fa'

export type CourseCardProps = {
  _id: string
  title: string
  description: string
  price: number
}

function CourseCard({ _id, title, description, price }: CourseCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/course/${_id}`)}
      className="
        bg-white
        border border-gray-200
        rounded-2xl
        overflow-hidden
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
        duration-300
        cursor-pointer
        flex flex-col
        h-full
        group
      "
    >
      {/* Image Placeholder with Gradient Overlay */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-500 w-full overflow-hidden flex items-center justify-center">
        {/* Icon */}
        <FaBook className="text-white text-6xl opacity-20 group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-4"></div>

        {/* Footer - Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₹{price}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/course/${_id}`)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition duration-200 text-sm group/btn"
          >
            View
            <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  )
}

export default CourseCard