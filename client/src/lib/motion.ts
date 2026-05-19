export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

export const softSpring = {
  type: "spring",
  stiffness: 180,
  damping: 20
};

export const scaleTap = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.98 }
};

