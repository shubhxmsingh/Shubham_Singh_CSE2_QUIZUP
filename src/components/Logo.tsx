'use client';

import Image from "next/image";

export function Logo() {
  return (
    <a href="/" className="flex flex-col items-center">
      <Image
        src="/upscaled_4k.png" 
        alt="QuizUP"
        width={64}
        height={64}
        className="mb-2"
      />
      <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-800 bg-clip-text text-transparent">
        QUIZUP
      </h1>
    </a>
  );
} 