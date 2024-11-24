// import React from "react";

import { Heart } from "lucide-react";

export default function Card ({ image, title, description, footerText }: any) {
    return (
  <div className="rounded overflow-hidden shadow-lg">
    <div className="relative">
      <a href="#">
        <img className="w-full" src={image} alt={title} />
        <div className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
      </a>
      <a href="#!">
        <div className="text-sm absolute top-0 right-0  px-4 text-white rounded-full h-16 w-16 flex flex-col items-center justify-center mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
          <Heart fill="indigo-600" />
        </div>
      </a>
    </div>
    <div className="px-6 py-4">
      <a
        href="#"
        className="font-semibold text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out"
      >
        {title}
      </a>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
    <div className="px-6 py-4 flex flex-row items-center">
      <a
        href="#"
        className="py-1 text-sm font-regular text-gray-900 mr-1 flex flex-row items-center"
      >
        <span className="ml-1">{footerText}</span>
      </a>
    </div>
  </div>
);
}

