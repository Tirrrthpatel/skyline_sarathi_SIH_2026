import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 2600,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, startAnimation]);

  return (
    <div className="inline-block relative [perspective:1000px] select-none">
      <AnimatePresence
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.div
          key={currentWord}
          initial={{
            opacity: 0,
            y: 28,
            rotateX: -60,
            filter: "blur(2px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          exit={{
            opacity: 0,
            y: -28,
            rotateX: 60,
            filter: "blur(2px)",
            position: "absolute",
            top: 0,
            left: 0,
            transition: {
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          className={cn(
            "z-10 inline-block relative text-left text-[#f3d400] font-sans font-black tracking-tighter",
            className
          )}
        >
          {currentWord.split(" ").map((word, wordIndex) => (
            <span
              key={word + wordIndex}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={word + letterIndex}
                  initial={{ opacity: 0, y: 12, rotateX: -45 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: wordIndex * 0.08 + letterIndex * 0.02,
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
